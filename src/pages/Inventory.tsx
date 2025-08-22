import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';

type EquipmentType = 'Компьютер' | 'Монитор' | 'Устройство';

interface FoundItem {
  id: number;
  type: EquipmentType;
  name: string;
  otherserial?: string;
  serial?: string;
  groups_id?: string;
}

interface BufferRow {
  key: string;
  input: string;
  status: 'search' | 'found' | 'not_found' | 'duplicate';
  display?: string;
  item?: FoundItem;
  attrs?: Record<string, string>;
}

const mockDB: FoundItem[] = [
  { id: 1, type: 'Компьютер', name: 'Dell Latitude 5520', otherserial: 'DL5520-001', serial: 'ABC123' },
  { id: 2, type: 'Устройство', name: 'HP LaserJet Pro M404n', otherserial: 'HP404-002', serial: 'HP404SN' },
  { id: 3, type: 'Монитор', name: 'Samsung S24F350', otherserial: 'SM24-003', serial: 'SM24SN' },
];

const StatusChip = ({ status }: { status: BufferRow['status'] }) => {
  switch (status) {
    case 'search':
      return <Chip label="Поиск..." color="warning" size="small" />;
    case 'found':
      return <Chip label="Найден" color="success" size="small" icon={<CheckCircleIcon />} />;
    case 'not_found':
      return <Chip label="Не найден" color="error" size="small" icon={<ErrorIcon />} />;
    case 'duplicate':
      return <Chip label="Дубликат" size="small" />;
    default:
      return null;
  }
};

const Row = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.25),
  borderRadius: 8,
  background: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
  border: '1px solid rgba(0,0,0,0.06)'
}));

const Inventory = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [rows, setRows] = useState<BufferRow[]>([]);
  const [massEditOpen, setMassEditOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [massField, setMassField] = useState<string>('comment');
  const [massOp, setMassOp] = useState<'replace' | 'append' | 'clear' | 'set' | 'unset'>('replace');
  const [massValue, setMassValue] = useState('');
  const [importSource, setImportSource] = useState<'clipboard' | 'csv' | 'txt' | 'xlsx'>('clipboard');
  const [clipboardText, setClipboardText] = useState('');
  const [uploadedData, setUploadedData] = useState<Array<Record<string, any>>>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'txt' | 'xlsx'>('csv');
  const [exportColumns, setExportColumns] = useState<Record<string, boolean>>({ input: true, status: true, otherserial: true, serial: true, name: false, comment: false, location: false, department: false, type: false });

  const foundKeys = useMemo(() => new Set(rows.filter(r => r.status === 'found').map(r => r.item?.otherserial || r.item?.serial)), [rows]);

  const addSerial = () => {
    const s = input.trim().replace(/^0+/, '');
    if (!s) return;

    const key = `${s}_${rows.length}`;
    const newRow: BufferRow = { key, input: s, status: 'search' };
    setRows(prev => [newRow, ...prev]);
    setInput('');

    // Поиск по mockDB (вместо API)
    setTimeout(() => {
      const matches = mockDB.filter(i => (i.otherserial && i.otherserial.includes(s)) || (i.serial && i.serial.includes(s)));
      if (matches.length === 0) {
        setRows(prev => prev.map(r => r.key === key ? { ...r, status: 'not_found' } : r));
      } else {
        const item = matches[0];
        const itemKey = item.otherserial || item.serial;
        const duplicate = itemKey && Array.from(foundKeys).includes(itemKey);
        setRows(prev => prev.map(r => r.key === key ? {
          ...r,
          status: duplicate ? 'duplicate' : 'found',
          item,
          display: `${item.type} ${item.name}`,
        } : r));
      }
    }, 100);
  };

  const pushSerial = (s: string) => {
    const key = `${s}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    const newRow: BufferRow = { key, input: s, status: 'search' };
    setRows(prev => [newRow, ...prev]);
    setTimeout(() => {
      const matches = mockDB.filter(i => (i.otherserial && i.otherserial.includes(s)) || (i.serial && i.serial.includes(s)));
      if (matches.length === 0) {
        setRows(prev => prev.map(r => r.key === key ? { ...r, status: 'not_found' } : r));
      } else {
        const item = matches[0];
        const itemKey = item.otherserial || item.serial;
        const duplicate = itemKey && Array.from(foundKeys).includes(itemKey);
        setRows(prev => prev.map(r => r.key === key ? { ...r, status: duplicate ? 'duplicate' : 'found', item, display: `${item.type} ${item.name}` } : r));
      }
    }, 50);
  };

  const removeRow = (key: string) => setRows(prev => prev.filter(r => r.key !== key));

  const clearBuffer = () => setRows([]);

  const removeNonGreen = () => setRows(prev => prev.filter(r => r.status === 'found').filter((r, idx, arr) => {
    const id = r.item?.otherserial || r.item?.serial;
    return id && arr.findIndex(x => (x.item?.otherserial || x.item?.serial) === id) === idx;
  }));

  const applyMassEdit = () => {
    setRows(prev => prev.map(r => {
      if (r.status !== 'found') return r;
      const current = r.attrs?.[massField] || '';
      let nextVal = current;
      if (massOp === 'replace' || massOp === 'set') nextVal = massValue;
      if (massOp === 'append') nextVal = current ? `${current}\n${massValue}` : massValue;
      if (massOp === 'clear' || massOp === 'unset') nextVal = '';
      return { ...r, attrs: { ...(r.attrs || {}), [massField]: nextVal } };
    }));
    setMassEditOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'xlsx' || ext === 'xls') {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Array<Record<string, any>>;
      setUploadedData(json);
      const cols = Object.keys(json[0] || {});
      setSelectedColumn(cols[0] || '');
      setImportSource('xlsx');
    } else if (ext === 'csv' || ext === 'txt') {
      const text = await file.text();
      const rows = text.split(/\r?\n/).filter(Boolean).map(line => ({ value: line.trim() }));
      setUploadedData(rows);
      setSelectedColumn('value');
      setImportSource(ext as any);
    }
    // reset input value so same file can be reselected
    e.currentTarget.value = '' as any;
  };

  const doImport = async () => {
    let values: string[] = [];
    if (importSource === 'clipboard') {
      values = clipboardText.split(/\r?\n|\t|,|;+/).map(s => s.trim()).filter(Boolean);
    } else {
      values = uploadedData.map(r => String(r[selectedColumn] ?? '').trim()).filter(Boolean);
    }
    values = values.map(v => v.replace(/^0+/, ''));
    values.forEach(v => pushSerial(v));
    setImportExportOpen(false);
    setClipboardText('');
    setUploadedData([]);
  };

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doExport = () => {
    const data = rows.map(r => ({
      input: r.input,
      status: r.status,
      otherserial: r.item?.otherserial || '',
      serial: r.item?.serial || '',
      name: r.item?.name || '',
      type: r.item?.type || '',
      comment: r.attrs?.comment || '',
      location: r.attrs?.location || '',
      department: r.attrs?.department || '',
    }));
    const headers = Object.keys(exportColumns).filter(k => exportColumns[k]);
    if (exportFormat === 'csv' || exportFormat === 'txt') {
      const sep = exportFormat === 'csv' ? ';' : '\t';
      const lines = [headers.join(sep), ...data.map(row => headers.map(h => `${String((row as any)[h] ?? '').replace(/"/g,'""')}`).join(sep))];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      download(blob, `inventory.${exportFormat}`);
    } else {
      const ws = XLSX.utils.json_to_sheet(data.map(row => {
        const obj: any = {};
        headers.forEach(h => { obj[h] = (row as any)[h]; });
        return obj;
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      XLSX.writeFile(wb, 'inventory.xlsx');
    }
    setImportExportOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Инвентаризация
      </Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Инвентарный/серийный номер"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addSerial(); }}
          sx={{ minWidth: 320, flexGrow: 1 }}
        />
        <Button variant="contained" onClick={addSerial}>Добавить</Button>
        <Button variant="outlined" onClick={clearBuffer}>Очистить</Button>
        <Button variant="outlined" onClick={removeNonGreen}>Убрать лишние</Button>
        <Button variant="outlined" onClick={() => setMassEditOpen(true)}>Действия</Button>
        <Button variant="outlined" onClick={() => setImportExportOpen(true)}>Импорт/Экспорт</Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Буфер</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {rows.map(r => (
            <Row key={r.key}>
              <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 200 }}>{r.input}</Typography>
              <StatusChip status={r.status} />
              {r.display && <Typography variant="body2" color="text.secondary">{r.display}</Typography>}
              {r.item && r.status === 'found' && (
                <Button size="small" startIcon={<InfoIcon />} onClick={() => navigate(`/equipment/${r.item?.id}`)}>
                  Открыть
                </Button>
              )}
              <Box sx={{ ml: 'auto' }} />
              <IconButton onClick={() => removeRow(r.key)}><DeleteIcon /></IconButton>
            </Row>
          ))}
        </Box>
      </Paper>

      {/* Диалог массовых изменений */}
      <Dialog open={massEditOpen} onClose={() => setMassEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Действия</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Поле</InputLabel>
              <Select label="Поле" value={massField} onChange={(e) => setMassField(e.target.value)}>
                <MenuItem value="comment">Комментарий</MenuItem>
                <MenuItem value="location">Местоположение</MenuItem>
                <MenuItem value="department">Департамент</MenuItem>
                <MenuItem value="status">Статус</MenuItem>
                <MenuItem value="shelf">Стеллаж</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Операция</InputLabel>
              <Select label="Операция" value={massOp} onChange={(e) => setMassOp(e.target.value as any)}>
                <MenuItem value="replace">Заменить (текст)</MenuItem>
                <MenuItem value="append">Добавить (текст)</MenuItem>
                <MenuItem value="clear">Очистить (текст)</MenuItem>
                <MenuItem value="set">Выбрать (список)</MenuItem>
                <MenuItem value="unset">Очистить (список)</MenuItem>
              </Select>
            </FormControl>
            {(massOp === 'replace' || massOp === 'append') && (
              <TextField fullWidth label="Значение" value={massValue} onChange={(e) => setMassValue(e.target.value)} />
            )}
            {(massOp === 'set') && (
              <TextField fullWidth label="Значение (строгое поле)" value={massValue} onChange={(e) => setMassValue(e.target.value)} />
            )}
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Будут изменены только строки со статусом «Найден».
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMassEditOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={applyMassEdit}>Применить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог Импорт/Экспорт */}
      <Dialog open={importExportOpen} onClose={() => setImportExportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Импорт / Экспорт</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Импорт</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Источник</InputLabel>
              <Select label="Источник" value={importSource} onChange={(e) => setImportSource(e.target.value as any)}>
                <MenuItem value="clipboard">Буфер обмена</MenuItem>
                <MenuItem value="csv">CSV файл</MenuItem>
                <MenuItem value="txt">Текстовый файл</MenuItem>
                <MenuItem value="xlsx">XLSX файл</MenuItem>
              </Select>
            </FormControl>
            
            {/* Улучшенная кнопка выбора файла */}
            <Box sx={{ position: 'relative' }}>
              <input
                type="file"
                accept={importSource === 'xlsx' ? '.xlsx,.xls' : importSource === 'csv' ? '.csv' : '.txt'}
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer'
                }}
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{
                    minWidth: 140,
                    height: 56,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                >
                  {importSource === 'clipboard' ? 'Не требуется' : 'Выберите файл'}
                </Button>
              </label>
            </Box>
          </Box>
          
          {importSource === 'clipboard' && (
            <TextField sx={{ mt: 2 }} fullWidth multiline minRows={4} label="Вставьте список номеров" value={clipboardText} onChange={(e) => setClipboardText(e.target.value)} />
          )}
          
          {/* Выбор столбца для всех форматов файлов */}
          {importSource !== 'clipboard' && !!uploadedData.length && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2">Выберите столбец с инвентарными/серийными номерами:</Typography>
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel>Столбец</InputLabel>
                <Select label="Столбец" value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
                  {Object.keys(uploadedData[0] || {}).map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Экспорт</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Формат</InputLabel>
              <Select label="Формат" value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)}>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="txt">TXT</MenuItem>
                <MenuItem value="xlsx">XLSX</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {Object.keys(exportColumns).map(k => (
                <FormControlLabel key={k} control={<Checkbox checked={!!exportColumns[k]} onChange={(e)=> setExportColumns(prev=>({ ...prev, [k]: e.target.checked }))} />} label={
                  k==='input'?'Ввод': k==='status'?'Статус': k==='otherserial'?'Инв. номер': k==='serial'?'Серийный': k==='name'?'Название': k==='type'?'Тип': k==='comment'?'Комментарий': k==='location'?'Местоположение':'Департамент'
                } />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={doImport}>Импортировать</Button>
          <Button variant="contained" onClick={doExport}>Экспортировать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;


