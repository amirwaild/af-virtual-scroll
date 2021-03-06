import React, { memo } from "react";
import PropTypes from "prop-types";

import isPositionStickySupported from "../utils/isPositionStickySupported";
import Context from "../Context";
import useStore from "../utils/useStore";

import FixedSizeTableStore from "../models/FixedSizeTable";
import VariableSizeTableStore from "../models/VariableSizeTable";

import RowComponentDefault from "./common/Row";
import CellComponentDefault from "./common/Cell";
import TotalsCellComponentDefault from "./common/TotalsCell";

import RowCountWarningContainerDefault from "../common/RowCountWarningContainer";

import NonStickyComponent from "./NonSticky";
import StickyComponent from "./Sticky";

import commonPropTypes from "../commonPropTypes";
import commonDefaultProps from "../commonDefaultProps";
import cx from "../utils/cx";

const Table = ({
    fixedSize,
    columns,
    totals,
    getRowData,
    getRowKey,
    getRowExtraProps,
    getCellExtraProps,
    rowCount,
    overscanRowsCount,
    rowCountWarningsTable,
    headless,
    RowCountWarningContainer,
    dataRef,
    nonSticky,
    className,
    ...props
}) => {

    const [ Store, scrollContainerRef, tbodyRef ] = useStore( fixedSize ? FixedSizeTableStore : VariableSizeTableStore, dataRef, {
        headlessMode: headless,
        rowDataGetter: getRowData,
        rowKeyGetter: getRowKey,
        overscanRowsCount,
        totals,
        columns,
        totalRows: Math.max( rowCount, 0 )
    });

    /*
        Only cells inside thead/tfoot can be sticky.
        If thead/tfoot are hidden - we can easily render lighter StickyComponent to avoid extra wrappers
    */
    const ComponentVariant = ( headless && !totals ) || ( !nonSticky && isPositionStickySupported() ) ? StickyComponent : NonStickyComponent;

    return (
        <Context.Provider value={Store}>
            { rowCount > 0 ? (
                <ComponentVariant
                    className={cx("afvscr-table-wrapper",className)}
                    scrollContainerRef={scrollContainerRef}
                    getRowExtraProps={getRowExtraProps}
                    getCellExtraProps={getCellExtraProps}
                    tbodyRef={tbodyRef}
                    {...props}
                />
            ) : rowCountWarningsTable ? (
                <RowCountWarningContainer>
                    {rowCountWarningsTable[rowCount]}
                </RowCountWarningContainer>
            ) : null }
        </Context.Provider>
    );
}

Table.propTypes = {
    ...commonPropTypes,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            // unique key for column
            dataKey: PropTypes.string.isRequired,

            // for details see CellComponent implementation
            getCellData: PropTypes.func,
            getEmptyCellData: PropTypes.func,
            format: PropTypes.func,
            render: PropTypes.func,
            formatTotal: PropTypes.func,

            visibility: PropTypes.oneOf([ "visible", "hidden" ]),
            sort: PropTypes.oneOf([ "locale", "numeric" ]),

            // column props, affecting colgroup > col tags
            background: PropTypes.string,
            border: PropTypes.string,
            width: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
            CellComponent: PropTypes.elementType,
            getCellExtraProps: PropTypes.func
        })
    ).isRequired,

    getCellExtraProps: PropTypes.func,

    totals: PropTypes.objectOf(
        // array may contain: "sum", "average", "count", "max", "min"
        PropTypes.array
    ),
    
    nonSticky: PropTypes.bool,
    headless: PropTypes.bool,

    HeaderRowComponent: PropTypes.elementType,
    CellComponent: PropTypes.elementType,
    TotalsCellComponent: PropTypes.elementType,

    RowCountWarningContainer: PropTypes.elementType,
    rowCountWarningsTable: PropTypes.object
};

Table.defaultProps = {
    ...commonDefaultProps,
    headless: false,

    //    For 90% non-reactive solutions, which only provide new getRowData when data is changed, memo is ok.
    //    If RowComponent should be wrapped my mobx observer - non-memo version should be imported.
    //    memo(observer(RowComponentDefault)) will do the trick.
    
    RowComponent: memo( RowComponentDefault ),
    CellComponent: CellComponentDefault,
    TotalsCellComponent: TotalsCellComponentDefault,
    RowCountWarningContainer: RowCountWarningContainerDefault,
};

export default memo( Table );