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

  const { show } = useSharedMenu(id);

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

          const ROW_ID_REGEXP = /row-(.*)/;
          const clickedRowElementId = path.find(elemId =>
            ROW_ID_REGEXP.test(elemId),
          );
          const rowMatch = clickedRowElementId?.match(ROW_ID_REGEXP)
          const clickedRowId = rowMatch 
            ? rowMatch[1] // this will be the match of the id, i.e. "row-14" -> "14"
            : null;

          const row = tableData.find(r => r.id === clickedRowId);
          if (!row) return;

          show({
            row: selectedRowIds.length ? null : row,
            target: e.target,
            position: {
              x: e.clientX,
              y: e.clientY,
            },
          });
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