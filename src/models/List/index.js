import EventEmitter from "eventemitter3";
import debounce from "lodash/debounce";
import clamp from "lodash/clamp";

import {
    calculateParentsInRange,
    walkUntil,
    sum,
    reallocateIfNeeded
} from "./treeUtils";

const ROW_MEASUREMENT_DEBOUNCE_INTERVAL = 50;
const ROW_MEASUREMENT_DEBOUNCE_MAXWAIT = 150;
const END_INDEX_CHECK_INTERVAL = 400;

const getRowDataInitial = () => {
    throw new Error( "getRowData must be provided" );
};

class List extends EventEmitter {

    totalRows = 0;
    startIndex = 0;
    endIndex = 0;

    virtualTopOffset = 0;
    widgetScrollHeight = 0;

    overscanRowsCount = 0;
    estimatedRowHeight = 0;

    scrollTop = 0;
    widgetHeight = 0;
    widgetWidth = 0;

    rowKeyGetter = undefined;
    rowDataGetter = getRowDataInitial;
    rowsContainerNode = null;
    scrollContainerNode = null;

    heighsCache = null;

    merge( params ){
        for( let k in params ){
            this.set( k, params[ k ] );
        }
    }

    set( paramName, paramValue ){

        if( process.env.NODE_ENV !== "production" ){
            if( !this.hasOwnProperty( paramName ) ){
                throw new Error( `Trying to merge key, which does not exist: ${paramName}` );
            }
        }

        const prevValue = this[ paramName ];

        if( prevValue !== paramValue ){
            this[ paramName ] = paramValue;
            this.emit( `#${paramName}`, prevValue );
        }

        return this;
    }

    updateWidgetScrollHeight(){
        /* In segments tree 1 node is always sum of all elements */
        return this.set( "widgetScrollHeight", this.heighsCache[ 1 ] );
    }

    /*
        TODO: maybe some react-like performUnitOfWork logic is needed here?
    */
    setVisibleRowsHeights = debounce(() => {
        const node = this.rowsContainerNode;

        if( node ){
            
            /*
                TODO:
                    make tree[ 0 ] more obvious and self-documented
            */
            const tree = this.heighsCache,
                N = tree[ 0 ];
            
            let l = -1,
                r = -1;

            /*
                Some benchmarks inspire me to use nextElementSibling
                https://jsperf.com/nextsibling-vs-childnodes-increment/2
            */
            for( let child = node.firstElementChild, newHeight, index; child; child = child.nextElementSibling ){
                
                /*
                    * aria-rowindex is counted from 1 according to w3c spec;
                    * parseInt with radix is 2x faster, then +, -, etc.
                      https://jsperf.com/number-vs-parseint-vs-plus/116
                */
                index = parseInt( child.getAttribute( "aria-rowindex" ), 10 ) - 1;

                if( process.env.NODE_ENV !== "production" && Number.isNaN( index ) ){
                    throw new Error( "aria-rowindex attribute must be present on each row. Look at default Row implementations." );
                }

                newHeight = child.offsetHeight;
                

                if( tree[ N + index ] !== newHeight ){
                    // console.log( "%d| was: %d; is: %d", index, tree[N+index],newHeight)
                    tree[ N + index ] = newHeight;
                    
                    if( l === -1 ){
                        l = index;
                    }
                    
                    r = index;
                }
            }
 
            if( l !== -1 ){
                if( process.env.NODE_ENV !== "production" ){
                    console.log( "Updating heights in range: %d - %d", l, r );
                }
                calculateParentsInRange( l, r, tree );
                this.updateWidgetScrollHeight();
            }
        }

        return this;
    }, ROW_MEASUREMENT_DEBOUNCE_INTERVAL, { maxWait: ROW_MEASUREMENT_DEBOUNCE_MAXWAIT });

    /*
        Column widths && heights may change during scroll/width-change,
        especially if table layout is not fixed.
    */
    increaseEndIndexIfNeeded = debounce(() => {
        const currentVisibleDist = sum( this.startIndex, this.endIndex, this.heighsCache );
        if( this.widgetHeight > this.virtualTopOffset + currentVisibleDist - this.scrollTop ){
            this.updateEndIndex();
        }
        return this;
    }, END_INDEX_CHECK_INTERVAL );

    cancelPendingAsyncCalls(){
        this.setVisibleRowsHeights.cancel();
        this.increaseEndIndexIfNeeded.cancel();
        return this;
    }

    refreshOffsets(){
        const newTopOffset = this.scrollTop;
        const [ newVisibleStartIndex, remainder ] = walkUntil( newTopOffset, this.heighsCache );
        const newStartIndex = Math.max( 0, newVisibleStartIndex - this.overscanRowsCount );
        const overscanOffset = sum( newStartIndex, newVisibleStartIndex, this.heighsCache );
                
        return this
            .set( "virtualTopOffset", newTopOffset - remainder - overscanOffset )
            .set( "startIndex", newStartIndex );
    }

    updateEndIndex(){
        /*
            TODO:
                perf benchmarks tell, that removeChild is called often.
                maybe cache previous range( endIndex - startIndex ) and if new range is smaller - throttle it's decrease?
        */
        const [ newEndIndex ] = walkUntil( this.scrollTop + this.widgetHeight, this.heighsCache );
        /*
            walkUntil works by "strict less" algo. It is good for startIndex,
            but for endIndex we need "<=", so adding 1 artificially.
        */
        return this.set( "endIndex", Math.min( newEndIndex + 1 + this.overscanRowsCount, this.totalRows ) );
    }

    toggleBasicEvents( method ){
        return this
            [ method ]( "#scrollTop", this.refreshOffsets, this )
            [ method ]( "#overscanRowsCount", this.refreshOffsets, this )
            [ method ]( "#widgetScrollHeight", this.increaseEndIndexIfNeeded )
            [ method ]( "#widgetHeight", this.updateEndIndex, this )
            [ method ]( "rows-rendered", this.setVisibleRowsHeights )
            [ method ]( "#startIndex", this.updateEndIndex, this )
            [ method ]( "#endIndex", this.increaseEndIndexIfNeeded.cancel )
            [ method ]( "#widgetWidth", this.setVisibleRowsHeights );
    }

    resetMeasurementsCache(){
        if( process.env.NODE_ENV !== "production" ){
            if( !this.estimatedRowHeight ){
                throw new Error( "estimatedRowHeight must be provided" );
            }
        }
        this.heighsCache = reallocateIfNeeded( this.heighsCache, this.totalRows, this.estimatedRowHeight );
        return this;
    }

    refreshHeightsCache( prevTotalRows ){
        if( this.totalRows > 0 ){
            if( prevTotalRows < 1 ){
                this.toggleBasicEvents( "on" );
            }

            this
                .resetMeasurementsCache()
                .updateWidgetScrollHeight()
                .updateEndIndex();
                
        }
        else{
            if( prevTotalRows > 0 ){
                this.toggleBasicEvents( "off" );
            }

            this.cancelPendingAsyncCalls();
                     
            /*
                this is not necessary, but heightsCache takes approximately 2 * sizeof(int) * rowCount memory
            */
            this.heighsCache = null;
            this.startIndex = this.endIndex = this.virtualTopOffset = this.scrollTop = 0;
        }
    }

    constructor(){
        super();
        
        this.on( "#totalRows", this.refreshHeightsCache, this );
    }

    destructor(){
        this
            .cancelPendingAsyncCalls()
            .removeAllListeners();
    }
    
    reportRowsRendered(){
        this.emit( "rows-rendered" );
    }

    scrollToRow( index ){
        const node = this.scrollContainerNode;
        if( node ){
            index = clamp( index, 0, this.totalRows );
            node.scrollTop = sum( 0, index, this.heighsCache );
        }
        return this;    
    }
};

export default List;