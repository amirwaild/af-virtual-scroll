import React, { useReducer, useRef, useState } from "react";
import map from "lodash/map";
import mapValues from "lodash/mapValues";
import { css } from "@emotion/core";
import { useForm } from "react-hook-form";
import useRandomColumnsAndRowsData from "./useRandomColumnsAndRowsData";
import TopDrawer from "./TopDrawer";
import Table from "../../src/Table";

const defaultValues = {
    widgetHeight: "auto",
    widgetWidth: "auto",
    rowCount: 5000,
    colCount: 6,
    overscanRowsCount: 4,
    fixedLayout: true,
    headless: false
};

const inputTypes = {
    number: "number",
    boolean: "checkbox"
};

const formHookParam = {
    defaultValues
};

const fullWidthCss = css`
    width: 100%;
`;

const wrapperCss = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: column nowrap;
    height: 100vh;
    font-family: monospace;

    input, button {
        padding: 0.3em;
        margin: 0.3em 0;
    }

    label {
        white-space: nowrap;
    }

    input:not([type="checkbox"]) {
        width: 100px;
    }

    table {
        border-collapse: separate;
        border-spacing: 0;
    }

    th {
        padding: 1em;
        border: 1px solid #000;
        background: #fff;
    }

    th + th,
    td + td {
        border-left-style: none;
    }

    tbody {
        tr td {
            border-top-style: none;
        }
        tr:last-child td {
            border-bottom-style: none;
        }
    }

    tfoot td {
        background: #fff;
    }

    td {
        border: 1px solid #666;
        padding: 0.3em;
    }
`;

const tableFormCss = css`
    display: table;
    label {
        display: table-row;
        & > * {
            display: table-cell;
        }
    }
`;

const formWrapperCss = css`
    display: flex;
    flex-flow: row wrap;
    align-content: center;
    justify-content: center;
    & > * {
        margin: 1em 2em;
    }
`;

const increment = j => j + 1;

const processFormValues = ( oldValues, newValues ) => mapValues( newValues, v => {
    const n = parseInt( v, 10 );
    if( Number.isFinite( n ) ){
        return n;
    }
    return v;
});

const rowCountWarningsTable = { "0": "AA", "-1" :"OO"};

const App = () => {
    
    const [{ colCount, rowCount, widgetHeight, widgetWidth, fixedLayout, overscanRowsCount, headless }, setFormValues ] = useReducer( processFormValues, defaultValues );

    const [ refreshId, forceColRowsRefresh ] = useState( 0 );

    const { columns, getRowData, totals } = useRandomColumnsAndRowsData( colCount, rowCount, refreshId );

    const { register, handleSubmit } = useForm( formHookParam );

    const tableRef = useRef();

    const scrollToRowSubmitHandler = e => {
        e.preventDefault();
        const { value } = e.currentTarget.elements.index;
        tableRef.current.scrollToRow( +value );
    };

    return (
        <div css={wrapperCss}>
            <TopDrawer>
                <div css={formWrapperCss}>
                    <form onSubmit={handleSubmit(setFormValues)}>
                        <div css={tableFormCss}>
                            {map(defaultValues, ( v, k ) => (
                                <label key={k}>
                                    <span>{k}:&nbsp;</span>
                                    <input name={k} type={inputTypes[typeof v]} ref={register} />
                                </label>
                            ))}
                        </div>
                        <button type="submit" css={fullWidthCss}>Update</button>
                    </form>
                    <div>
                        <button css={fullWidthCss} onClick={() => forceColRowsRefresh( increment )}>
                            Regenerate cols({colCount}) and rows({rowCount})
                        </button>
                        <form onSubmit={scrollToRowSubmitHandler}>
                            <label>
                                <span>Scroll to row:&nbsp;</span>
                                <input type="number" name="index" defaultValue={0} />
                                &nbsp;
                                <button type="submit">Scroll</button>
                            </label>
                        </form>
                    </div>
                </div>
            </TopDrawer>           
            <Table
                style={{
                    height: widgetHeight,
                    width: widgetWidth
                }}
                useStickyIfPossible
                estimatedRowHeight={21}
                totals={totals}
                getRowData={getRowData}
                rowCount={rowCount}
                columns={columns}
                fixedLayout={fixedLayout}
                headless={headless}
                overscanRowsCount={overscanRowsCount}
                dataRef={tableRef}
                rowCountWarningsTable={rowCountWarningsTable}
            />
        </div>
    );
};

export default App;