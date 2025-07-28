import React, { useMemo, useContext, useCallback } from 'react';
import { AppContext } from '../AppProvider';
import { displayConfig } from './LoardData';
import { useTable, useSortBy, useFilters, useGlobalFilter } from 'react-table';
import DskContextMenu from './DskContextMenu';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GetIcon } from './IconManager';

const Content = () => {
  const {
    selectedRow,
    setSelectedRow,
    contextMenu,
    formatSize,
    handleRightClick,
    handleCloseContextMenu,
    handleDoubleClick,
    displayMode, 
    searchQuery,
    contents,
    iconSize
  } = useContext(AppContext);

  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  const filteredContents = useMemo(() => {
    return contents.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [contents, searchQuery]);

  const columns = useMemo(
    () => [
      {
        Header: 'Nom',
        accessor: 'name',
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <GetIcon item={row.original} size={iconSize} className="flex-shrink-0" />
            <span className="truncate">{row.original.name}</span>
          </div>
        ),
        className: 'wide-column',
      },
      {
        Header: 'Modifié le',
        accessor: 'last_modified',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Type',
        accessor: 'type',
        className: 'hidden',
      },
      {
        Header: 'Taille',
        accessor: 'size',
        Cell: ({ value }) => formatSize(value),
      },
    ],
    [formatDate, formatSize, iconSize]
  );

  const data = useMemo(() => filteredContents, [filteredContents]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    { columns, data },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  return (
    <div className={`content ${displayConfig[displayMode].container} h-full`} onClick={handleCloseContextMenu}>
      {displayMode === 'columns' ? (
        <div className="h-full overflow-auto table-container">
          <table {...getTableProps()} className="min-w-full bg-white table-auto">
            <thead className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map(column => {
                    const columnProps = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th
                        key={column.id}
                        {...columnProps}
                        className={`py-3 px-4 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors ${
                          column.id === 'name' ? 'w-[40%]' : 'w-[20%]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {column.render('Header')}
                          {column.isSorted && (
                            column.isSortedDesc ? 
                              <FaChevronDown className="text-gray-500" /> : 
                              <FaChevronUp className="text-gray-500" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr
                    key={row.id}
                    {...row.getRowProps()}
                    onDoubleClick={() => handleDoubleClick(row.original)}
                    onContextMenu={(event) => handleRightClick(event, row.original)}
                    className={`cursor-pointer border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      selectedRow === row.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => setSelectedRow(row.id)}
                  >
                    {row.cells.map(cell => (
                      <td
                        key={cell.column.id}
                        {...cell.getCellProps()}
                        className="px-4 py-3 text-gray-700"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredContents.map((item, index) => (
              <div
                key={index}
                onDoubleClick={() => handleDoubleClick(item)}
                onClick={() => setSelectedRow(index)}
                onContextMenu={(event) => handleRightClick(event, item)}
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-md ${
                  selectedRow === index ? 'bg-blue-100 shadow-md' : ''
                }`}
              >
                <div className="mb-2">
                  <GetIcon item={item} size={iconSize} />
                </div>
                <span className="text-sm text-gray-700 text-center truncate w-full" title={item.name}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {contextMenu && (
        <DskContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.options}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

export default Content;
