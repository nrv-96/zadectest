
import React, { useEffect, useState } from 'react';

function App() {
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState(["", "", "", ""]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addRow, setAddRow] = useState(["", "", "", ""]);

  // Fetch data from backend (Google Sheets)
  const fetchSheetData = () => {
    fetch('https://automatic-fortnight-w5w79r55p4rfggqq-5000.app.github.dev/api/sheet')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRows(data);
        } else {
          setRows([]);
        }
      });
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditRow(rows[idx]);
  };

  const handleChange = (e, colIdx) => {
    const updated = [...editRow];
    updated[colIdx] = e.target.value;
    setEditRow(updated);
  };

  const handleSave = async () => {
    await fetch('https://automatic-fortnight-w5w79r55p4rfggqq-5000.app.github.dev/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex: editIndex, rowData: editRow })
    });
    const updatedRows = [...rows];
    updatedRows[editIndex] = editRow;
    setRows(updatedRows);
    setEditIndex(null);
  };

  const filteredRows = rows.filter((row, idx) => {
    if (idx === 0) return true; // header
    return row.join(' ').toLowerCase().includes(search.toLowerCase());
  });

  const handleAddChange = (e, colIdx) => {
    const updated = [...addRow];
    updated[colIdx] = e.target.value;
    setAddRow(updated);
  };

  const [addError, setAddError] = useState("");
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    // Validation
    const id = addRow[0].trim();
    const name = addRow[1].trim();
    const age = Number(addRow[2]);
    const email = addRow[3].trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!/^[0-9]+$/.test(id) || age < 1 || age > 100 || !Number.isInteger(age)) {
      setAddError("ID and Age must be a positive integer between 1 and 100.");
      return;
    }
    if (!name) {
      setAddError("Name is required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setAddError("Email must be a valid email address.");
      return;
    }
    // Find next available row index (append to end)
    const rowIndex = rows.length;
    await fetch('https://automatic-fortnight-w5w79r55p4rfggqq-5000.app.github.dev/api/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex, rowData: addRow })
    });
    setShowAdd(false);
    setAddRow(["", "", "", ""]);
    fetchSheetData();
  };

  // --- UI render below ---
  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f7f7fa', minHeight: '100vh', padding: 0, margin: 0 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '24px 0', textAlign: 'center', boxShadow: '0 2px 8px #0001' }}>
        <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>Google Sheets CRUD Dashboard</h1>
      </div>
      <div style={{ maxWidth: 900, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
            onClick={fetchSheetData}
          >
            Show Data
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: '1px solid #ddd', borderRadius: 6, padding: '10px 16px', fontSize: 16, width: 220, marginRight: 16 }}
          />
          <button
            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
            onClick={() => setShowAdd(true)}
          >Add New Record</button>
        </div>
        {/* Add New Record Modal */}
        {showAdd && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0006',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <form onSubmit={handleAddSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, boxShadow: '0 2px 8px #0002' }}>
              <h2 style={{ marginTop: 0, marginBottom: 24 }}>Add New Record</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input placeholder="ID (1-100)" value={addRow[0]} onChange={e => handleAddChange(e, 0)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }} required type="number" min="1" max="100" />
                <input placeholder="Name" value={addRow[1]} onChange={e => handleAddChange(e, 1)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }} required />
                <input placeholder="Age (1-100)" value={addRow[2]} onChange={e => handleAddChange(e, 2)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }} required type="number" min="1" max="100" />
                <input placeholder="Email" value={addRow[3]} onChange={e => handleAddChange(e, 3)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }} required type="email" />
              </div>
              {addError && <div style={{ color: 'red', marginTop: 12 }}>{addError}</div>}
              <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Add</button>
              </div>
            </form>
          </div>
        )}
        <div style={{ background: '#f7f7fa', borderRadius: 8, padding: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>
                <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left' }}>ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left' }}>NAME</th>
                <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left' }}>AGE</th>
                <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left' }}>EMAIL</th>
                <th style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'left' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length <= 1 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 18 }}>No records found</td>
                </tr>
              ) : (
                filteredRows.slice(1).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    {editIndex === idx + 1 ? (
                      row.map((cell, colIdx) => (
                        <td key={colIdx} style={{ padding: 12 }}>
                          <input value={editRow[colIdx]} onChange={e => handleChange(e, colIdx)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', width: '100%' }} />
                        </td>
                      ))
                    ) : (
                      row.map((cell, colIdx) => <td key={colIdx} style={{ padding: 12 }}>{cell}</td>)
                    )}
                    <td style={{ padding: 12 }}>
                      {editIndex === idx + 1 ? (
                        <button onClick={handleSave} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Save</button>
                      ) : (
                        <button onClick={() => handleEdit(idx + 1)} style={{ background: '#fbbf24', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
