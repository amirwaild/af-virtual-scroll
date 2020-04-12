/*! For license information please see 21.caacaec6fccaeb7b336d.js.LICENSE.txt */
(window.Z=window.Z||[]).push([[21],{1249:function(e,t,l){"use strict";l.r(t);var a=l(0),n=l(9),c=l(2),o=l(68);var r={name:"i4bho8-codeCss",styles:"font-size:0.8em;display:inline-flex;;label:codeCss;"};var s={basic:function(){return Object(c.c)(a.Fragment,null,Object(c.c)("h3",null,"Usage"),Object(c.c)(o.a,{css:r},'/* import style once in your project */\nimport "af-virtual-scroll/lib/style.css";\n\n/* import component( both named and default import syntax supported ) */\nimport { Table, List } from "af-virtual-scroll";\n\n/* OR */\nimport Table from "af-virtual-scroll/lib/Table";\nimport List from "af-virtual-scroll/lib/List";\n/* end import */\n\n/*Polyfill ResizeObserver and MutationObserver if needed.*/\nconst examplePolyfill = "https://github.com/juggle/resize-observer";'),Object(c.c)("h3",null,"Common props (Table/List)"),Object(c.c)("ul",null,Object(c.c)("li",null,Object(c.c)("h4",{"data-required":!0},"rowCount"),Object(c.c)("p",null,"Indicates number of rows for table/list.")),Object(c.c)("li",null,Object(c.c)("h4",{"data-required":!0},"getRowData(rowIndex)"),Object(c.c)("p",null,"Returns row data object. If a reference to this method changes - table/list reloads data, so it should be wrapped with useCallback.")),Object(c.c)("li",null,Object(c.c)("h4",null,"getRowKey(rowIndex)"),Object(c.c)("p",null,"By default rowIndex is used as row key. If you want to optimize this - go ahead.")),Object(c.c)("li",null,Object(c.c)("h4",null,"getRowExtraProps(rowData,rowIndex,rowDataIndex)"),Object(c.c)("p",null,"Returns an object of extra props, that will be passed to row wrapper(usually tr for table and div for list). Hooks also can be called here. rowIndex afer sorting remains 1, 2, 3, etc. rowDataIndex refers initial data indexes ( can be 1, 10, 5, 3, etc. )")),Object(c.c)("li",null,Object(c.c)("h4",null,"className"),Object(c.c)("p",null,"Widget wrapper additional css class.")),Object(c.c)("li",null,Object(c.c)("h4",null,"fixedSize"),Object(c.c)("p",null,"By default table/list assumes, that it's rows have different heights. If you are SURE, that all rows always will have same height(after collapsing widget width, etc.) - put this prop as true. This will optimize calculations. For details see difference between FixedSizeList and VariableSizeList ",Object(c.c)("a",{href:"https://github.com/nowaalex/af-virtual-scroll/tree/master/src/models",target:"_blank"},"here."))),Object(c.c)("li",null,Object(c.c)("h4",null,"overscanRowsCount"),Object(c.c)("p",null,"Determines, how many rows are drawn above and below table/list visible part."))),Object(c.c)("h3",null,"List props"),Object(c.c)("ul",null,Object(c.c)("li",null,"RowComponent"),Object(c.c)("p",null,Object(c.c)("a",{href:"https://github.com/nowaalex/af-virtual-scroll/blob/master/src/List/common/Row.js",target:"_blank"},"Default implementation"))),Object(c.c)("h3",null,"Table props"),Object(c.c)("ul",null,Object(c.c)("li",null,Object(c.c)("h4",{"data-required":!0},"columns"),Object(c.c)("p",null,"Array of objects of shape:"),Object(c.c)(o.a,{css:r},'{\n    // unique key for column\n    dataKey: string.isRequired,\n\n    // for details see CellComponent implementation\n    getCellData: func,\n    getEmptyCellData: func,\n    format: func,\n    render: func,\n    formatTotal: func,\n\n    visibility: oneOf([ "visible", "hidden" ]),\n    sort: oneOf([ "locale", "numeric" ]),\n\n    // column props, affecting colgroup > col tags\n    background: string,\n    border: string,\n    width: oneOfType([ number, string ]),\n\n    // These two override global props, if present\n    CellComponent: any,\n    getCellExtraProps: func\n}')),Object(c.c)("li",null,Object(c.c)("h4",null,"headless"),Object(c.c)("p",null,"Omits thead rendering if enabled.")),Object(c.c)("li",null,Object(c.c)("h4",null,"totals"),Object(c.c)("p",null,'Object, where keys are column dataKeys, and values are arrays of ( "sum", "average", "count", "max", "min" ).'),Object(c.c)(o.a,{css:r},'{\n    column1: [ "sum", "max" ],\n    column2: [ "average" ]\n}')),Object(c.c)("li",null,Object(c.c)("h4",null,"nonSticky"),Object(c.c)("p",null,"Scrollable table body can be achieved either by position: sticky table cells or by rendering 3 separate tables. This prop allows to render table in non-sticky mode, even when browser supports position: sticky. ",Object(c.c)("br",null),Object(c.c)("a",{href:"https://github.com/nowaalex/af-virtual-scroll/blob/master/src/utils/isPositionStickySupported/index.js",target:"_blank"},"Util implementation"))),Object(c.c)("li",null,Object(c.c)("h4",null,"RowComponent"),Object(c.c)("p",null,Object(c.c)("a",{href:"https://github.com/nowaalex/af-virtual-scroll/blob/master/src/Table/common/Row.js",target:"_blank"},"Default implementation"))),Object(c.c)("li",null,Object(c.c)("h4",null,"CellComponent"),Object(c.c)("p",null,Object(c.c)("a",{href:"https://github.com/nowaalex/af-virtual-scroll/blob/master/src/Table/common/Cell.js",target:"_blank"},"Default implementation"))),Object(c.c)("li",null,Object(c.c)("h4",null,"TotalsCellComponent"),Object(c.c)("p",null,Object(c.c)("a",{href:"https://github.com/nowaalex/af-virtual-scroll/blob/master/src/Table/common/TotalsCell.js",target:"_blank"},"Default implementation"))),Object(c.c)("li",null,Object(c.c)("h4",null,"getCellProps(rowData,columnIndex)"),Object(c.c)("p",null,"Returns an object of extra props, that will be passed to td. Hooks also can be called here."))))}},i={name:"a8iifa-wrapperCss",styles:'text-align:left;margin-left:1em;[data-required]{&:after{color:#780b0b;content:" (required)";}};label:wrapperCss;'};t.default=function(){var e=Object(n.h)().docpage,t=e&&s[e];return t?Object(c.c)("div",{css:i},Object(c.c)(t,null)):"Page not found"}},68:function(e,t,l){"use strict";var a=l(4),n=(l(0),l(1247)),c=l(82),o=l(83),r=l(2);n.a.registerLanguage("javascript",c.a);var s={borderRadius:"none",margin:0},i={name:"14fb4y3-codeCss",styles:"font-size:0.9em;;label:codeCss;"};t.a=function(e){return Object(r.c)(n.a,Object(a.a)({css:i,language:"javascript",style:o.a,customStyle:s},e))}}}]);
//# sourceMappingURL=sm.21.b3c8df5d6ff7851c3c51ae6949c99101.map