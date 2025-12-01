const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/home/jerrold/workspace/retirement/Retirement_Planning/data/retirement.db');

db.all("PRAGMA table_info(savings_accounts)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Columns in savings_accounts table:');
    rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });
  }
  db.close();
});
