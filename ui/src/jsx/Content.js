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
          <div className="flex items-center gap-1">
            <GetIcon item={row.original} size={iconSize} className="mr-2" />
            {row.original.name}
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
    [formatDate, formatSize]
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
    <div className={`content ${displayConfig[displayMode].container}`} onClick={handleCloseContextMenu}>
      {displayMode === 'columns' ? (
        <div className="h-screen overflow-auto table-container">
          <table {...getTableProps()} className="min-w-full bg-transparent table-auto">
            <thead className="sticky top-0 z-10 bg-gray-800">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map(column => {
                    const columnProps = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th
                        key={column.id}  // Explicitly set the key here
                        {...columnProps}
                        className={`py-2 px-4 text-start ${column.id === 'name' ? 'w-[40%]' : 'w-[20%]'}`}
                        style={{ textAlign: 'left' }}
                      >
                        {column.isSorted ? column.isSortedDesc ? <FaChevronUp /> : <FaChevronDown /> : ''}{column.render('Header')}
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
                    key={row.id}  // Explicitly set the key here
                    {...row.getRowProps()}
                    onDoubleClick={() => handleDoubleClick(row.original)}
                    onContextMenu={(event) => handleRightClick(event, row.original)}
                    className={`cursor-pointer ${selectedRow === row.id ? 'bg-neutral-500' : ''} hover:bg-neutral-600`}
                    onClick={() => setSelectedRow(row.id)}
                  >
                    {row.cells.map(cell => (
                      <td
                        key={cell.column.id}  // Explicitly set the key here
                        {...cell.getCellProps()}
                        className="px-4 py-2 truncate text-ellipsis"
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
        filteredContents.map((item, index) => (
          <div
            key={index}  // Explicitly set the key here
            onDoubleClick={() => handleDoubleClick(item)}
            onClick={() => setSelectedRow(index)}
            onContextMenu={(event) => handleRightClick(event, item)}
            className={`flex gap-2 justify-start cursor-pointer p-2 ${displayConfig[displayMode].item} ${selectedRow === index ? 'bg-blue-500' : ''} hover:bg-blue-400`}
            style={{ width: '100%' }}
          >
            <GetIcon item={item} size={iconSize} />
            <span className="text-white truncate">{item.name}</span>
          </div>
        ))
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
