import { FC, useCallback, useContext, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { tableData } from './data';
import { MyCustomMenu } from './MyCustomMenu';
import { MyCustomDataContextMenuCtx, OrderRow } from './types';
import { getDomPath } from './utils';

export const MyTable: FC<{ id: string }> = ({ id }) => {
  const { useSharedMenu } = useContext(MyCustomDataContextMenuCtx);

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const toggleSelectRow = useCallback((id: string) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(s => s.filter(i => i !== id))
    } else {
      setSelectedRowIds(s => [...s, id]);
    }
  }, [selectedRowIds, setSelectedRowIds]);

  const { 
    show, 
  } = useSharedMenu(id);

  const columns = useMemo(() => [
    {
      name: (
        <input 
          type="checkbox" 
          checked={selectedRowIds.length === tableData.length}
          onChange={() => {
            if (selectedRowIds.length === tableData.length) {
              setSelectedRowIds([]);
            } else {
              setSelectedRowIds(tableData.map(r => r.id));
            }
          }}
        />
      ),
      selector: (row: OrderRow) => row.id,
      cell: (row: OrderRow) => (
        <input 
          type="checkbox" 
          checked={selectedRowIds.includes(row.id)}
          onChange={() => toggleSelectRow(row.id)}
        />
      )
    },
    {
      name: 'ID',
      selector: (row: OrderRow) => row.id,
    },
    {
      name: 'Name',
      selector: (row: OrderRow) => row.name,
    },
    {
      name: 'Description',
      selector: (row: OrderRow) => row.description,
    },
    {
      name: 'Parcels',
      selector: (row: OrderRow) => row.parcels,
    },
    {
      name: (
        <button 
          disabled={selectedRowIds.length === 0}
          onClick={e => {
            show({
              position: {
                x: e.clientX,
                y: e.clientY,
              }
            });
          }}
        >
          ...
        </button>
      ),
      cell: (row: OrderRow) => {
        return (
          <button 
            onContextMenu={e => {
              e.preventDefault();
              e.stopPropagation();
              show({
                row,
                position: {
                  x: e.clientX,
                  y: e.clientY,
                }
              });
            }}
            onClick={e => {
              show({
                row,
                position: {
                  x: e.clientX,
                  y: e.clientY,
                }
              });
            }}
          >
            ...
          </button>
        )
      }
    },
  ], [
    toggleSelectRow,
    show,
    selectedRowIds,
    setSelectedRowIds,
  ]);

  return (
    <>
      <div 
        onContextMenu={e => {
          e.preventDefault();
          const path = getDomPath(e.target);
          // ugly as hell but just for demo
          const rowId = path.find(p => p.indexOf('row-') > -1)?.split('row-')[1];
          const row = tableData.find(r => r.id === rowId);

          const canShow = row || selectedRowIds.length > 0;

          if (canShow) {
            show({
              row: selectedRowIds.length ? null : row,
              target: e.target,
              position: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          }
        }}
      >
        <DataTable
          columns={columns}
          data={tableData}
        />
      </div>
      <MyCustomMenu id={id} />
    </>
  );
};