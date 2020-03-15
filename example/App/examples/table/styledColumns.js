import Table from "af-react-table/lib/Table";
import times from "lodash/times";
import range from "lodash/range";
import r from "lodash/random";
import { css } from "@emotion/core";

const wrapperCss = css`
    table {
        border-spacing: 0;
    }
    tfoot td, th {
        padding: 0.5em;
        background: #e6e6e6;
        font-weight: bold;
    }
    tr[data-odd]{
        background: rgba(0,0,0,0.5)
    }
`;

const colCount = 5;

const getRowExtraProps = ( rowData, rowDataIndex ) => rowDataIndex % 2 ? { "data-odd": "" } : null;

const columns = times( colCount, colIndex => ({
    dataKey: `col${colIndex}`,
    label: `col${colIndex}`,
    background: `rgb(${r(130,220)}, ${r(130,220)}, ${r(130,220)})`,
    width: r( 50, 300 )
}));

const getRowData = index => range( colCount ).reduce(( acc, colIndex ) => {
    acc[ `col${colIndex}` ] = index;
    return acc;
}, {});

const totals = range( colCount ).reduce(( acc, colIndex ) => {
    acc[ `col${colIndex}` ] = [ "count" ];
    return acc;
}, {});

const TableWithStyledColumns = () => (
    <Table
        getRowExtraProps={getRowExtraProps}
        css={wrapperCss}
        useStickyIfPossible
        getRowData={getRowData}
        rowCount={500}
        totals={totals}
        columns={columns}
    />
);

export default TableWithStyledColumns;