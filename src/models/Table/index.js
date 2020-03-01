import debounce from "lodash/debounce";
import subtract from "lodash/subtract";
import addSetters from "../../utils/addSetters";
import List from "../List";

const ROW_WIDTH_MEASUREMENT_INTERVAL = 100;
const REFRESH_SORT_DEBOUNCE_INTERVAL = 500;

const getRowDataInitial = () => {
    throw new Error( "getRowData must be provided for table" );
};

const fillOrderedRowsArray = ( arr, startIndex, endIndex ) => {
    while( startIndex < endIndex ){
        arr[ startIndex ] = startIndex++;
    }
};

const L = new Intl.Collator();

const getSorter = ( getRowData, fieldName, method, getCellData, directionSign ) => {
    const fn = method === "locale" ? L.compare : subtract;
    const defaultValue = method === "locale" ? "" : 0;

    if( getCellData ){
        return ( a, b, i ) => {
            a = getRowData( a );
            a = a ? getCellData( a, i ) : defaultValue;
            b = getRowData( b );
            b = b ? getCellData( b, i ) : defaultValue;
            return fn( a, b ) * directionSign;
        };
    }
    
    return ( a, b ) => {
        a = getRowData( a );
        a = a ? a[ fieldName ] : defaultValue;
        b = getRowData( b );
        b = b ? b[ fieldName ] : defaultValue;
        return fn( a, b ) * directionSign;
    };
};

const calculateSum = ( totalRows, dataKey, getRowData, getCellData ) => {
    let res = 0;
    for( let i = 0, rowData, cellData; i < totalRows; i++ ){
        rowData = getRowData( i );
        cellData = getCellData ? getCellData( rowData, i ) : rowData[ dataKey ];
        if( cellData ){
            res += cellData;
        }
    }
    return res;
};

/*
    We could use simple object literal,
    but constructors with stable-order this initialization enforce "hidden-classes" v8 optimization
*/
class TotalsCachePart {
    constructor(){
        this.count = 0;
        this.sum = 0;
        this.average = 0.0;
    }
}

class Table extends List {

    sortColumnIndex = -1;
    sortDirectionSign = 1;

    scrollLeft = 0;
    tbodyColumnWidths = [];
    orderedRows = [];

    /*
        We do not want to recalculate totals too often, so caching them in object by column dataKey
    */
    totalsCache = Object.create( null );

    refreshTotalsForColumn( dataKey ){
        const curTotals = this.totals[ dataKey ];
        if( curTotals ){
            let curCachePart = this.totalsCache[ dataKey ];

            if( !curCachePart ){
                curCachePart = this.totalsCache[ dataKey ] = new TotalsCachePart();
            }
            
            for( let j = 0, totalType, oldVal, newVal; j < curTotals.length; j++ ){
                totalType = curTotals[ j ];
                oldVal = curCachePart[ totalType ];
                switch( curTotals[ j ] ){
                    case "count":
                        newVal = this.totalRows;
                        break;
                    case "sum":
                        newVal = calculateSum( this.totalRows, dataKey, this.rowDataGetter );
                        break;
                    case "average":
                        /* Todo: optimize, if we already calculated sum */
                        newVal = calculateSum( this.totalRows, dataKey, this.rowDataGetter ) / this.totalRows;
                        break;
                    default:
                        if( process.env.NODE_ENV !== "production" ){
                            console.error( `Unknown totals type: ${curTotals[ j ]}` );
                        }
                }
                if( oldVal !== newVal ){
                    curCachePart[ totalType ] = newVal;
                    this.emit( "totals-calculated" );
                }
            }
        }
        else if( process.env.NODE_ENV !== "production" ){
            console.warn( `Asked to recalculate wrong totals. Datakey: ${dataKey}` );
        }
        return this;
    }

    refreshTotals = debounce(() => {
        for( let j = 0, dataKey; j < this.columns.length; j++ ){
            dataKey = this.columns[ j ].dataKey;
            this.refreshTotalsForColumn( dataKey );
        }
    }, 100 );

    setSortParams( colIndex, sortDirectionSign ){
        if( this.sortColumnIndex !== colIndex || sortDirectionSign !== this.sortDirectionSign ){
            this.sortColumnIndex = colIndex;
            this.sortDirectionSign = sortDirectionSign;
            this.emit( "sort-params-changed" );
        }
    }

    refreshSorting = debounce(() => {
        if( this.sortColumnIndex > -1 && this.totalRows > 0 ){
            const { sort, dataKey, getCellData } = this.columns[ this.sortColumnIndex ];
            if( sort ){
                const sorter = getSorter( this.rowDataGetter, dataKey, sort, getCellData, this.sortDirectionSign );
                this.orderedRows.sort( sorter );
                this.emit( "rows-order-changed" );
            }
        }
    }, REFRESH_SORT_DEBOUNCE_INTERVAL );

    calculateTbodyColumnWidths = debounce(() => {
        const node = this.getRowsContainerNode();
        if( node ){
            for( let tr = node.firstElementChild; tr; tr = tr.nextElementSibling ){
                /* we must select "correct" rows without colspans, etc. */
                if( tr.childElementCount === this.columns.length ){
                    let columnWidthsChanged = false;
                    for( let td = tr.firstElementChild, j = 0, width; td; td = td.nextElementSibling, j++ ){
                        width = td.offsetWidth;
                        if( this.tbodyColumnWidths[ j ] !== width ){
                            this.tbodyColumnWidths[ j ] = width;
                            columnWidthsChanged = true;
                        }
                    }
                    if( columnWidthsChanged ){
                        this.emit( "column-widths-changed" );
                    }
                    break;
                }
            }
        }
    }, ROW_WIDTH_MEASUREMENT_INTERVAL, { maxWait: ROW_WIDTH_MEASUREMENT_INTERVAL });

    refreshRowsOrder( prevTotalRows ){
        if( this.totalRows > 0 ){
            this.orderedRows.length = this.totalRows;
            fillOrderedRowsArray( this.orderedRows, this.totalRows > prevTotalRows ? prevTotalRows : 0, this.totalRows );
        }
        else{
            this.orderedRows.length = 0;
        }
        return this;
    }

    toggleColumnWidthMeasurerEvents( method ){
        return this
            [ method ]( "rows-rendered", this.calculateTbodyColumnWidths )
            [ method ]( "widget-width-changed", this.calculateTbodyColumnWidths );
    }

    refreshHeadlessMode(){
        if( this.headlessMode ){
            this
                .toggleColumnWidthMeasurerEvents( "off" )
                .calculateTbodyColumnWidths.cancel();
        }
        else{
            this
                .toggleColumnWidthMeasurerEvents( "on" )
                .calculateTbodyColumnWidths();
        }
        return this;
    }

    resetColumnWidthsCache(){
        this.tbodyColumnWidths.length = this.columns.length;
        this.tbodyColumnWidths.fill( 0, 0, this.columns.length );
    }

    constructor( params ){
        super( params );

        this
            .on( "headless-mode-changed", this.refreshHeadlessMode, this )
            .on( "columns-changed", this.resetColumnWidthsCache, this )
            .on( "columns-changed", this.refreshTotals )
            .on( "total-rows-changed", this.refreshRowsOrder, this )
            .on( "total-rows-changed", this.refreshSorting )
            .on( "total-rows-changed", this.refreshTotals )
            .on( "sort-params-changed", this.refreshSorting )
            .on( "columns-changed", this.refreshSorting )
            .on( "row-data-getter-changed", this.refreshSorting )
            .on( "row-data-getter-changed", this.refreshTotals )
            .on( "rows-order-changed", this.resetMeasurementsCache, this )
            .on( "rows-order-changed", () => this.scrollToRow( 0 ) )
            .on( "totals-changed", this.refreshTotals )
        
            .setColumns( params.columns || [] )
            .setTotals( params.totals )
            .setHeadlessMode( !!params.headlessMode )
            .setRowDataGetter( params.rowDataGetter || getRowDataInitial )
            .refreshRowsOrder( 0 );
    }

    destructor(){
        this.calculateTbodyColumnWidths.cancel();
        this.refreshSorting.cancel();
        this.refreshTotals.cancel();
        super.destructor();
    }
}

addSetters( Table.prototype, [
    "columns",
    "totals",
    "scrollLeft",
    "rowDataGetter",
    "headlessMode"
]);

export default Table;