/* ==========================================================================
   STACKED TABLES ON PHONES
   The HOD and college tables are rebuilt by their scripts whenever data changes. This labels every cell
   with its column heading (data-label) so that, on narrow screens, the CSS in teacher-dashboard.css can
   show each row as a small card of "heading: value" pairs instead of a sideways-scrolling table.
   On wide screens the labels are simply not displayed.
   ========================================================================== */
(function () {
    'use strict';
    if (window.__orixaStackTables) return;
    window.__orixaStackTables = true;

    const TABLES = '.hod-data-table, .college-data-table';
    let queued = false;

    function labelTable(table) {
        const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.replace(/\s+/g, ' ').trim());
        table.querySelectorAll('tbody tr').forEach(row => {
            Array.from(row.children).forEach((cell, index) => {
                if (cell.tagName !== 'TD' || cell.hasAttribute('colspan')) return;
                const label = headings[index];
                if (label !== undefined && cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
            });
        });
    }

    function labelAll() {
        queued = false;
        document.querySelectorAll(TABLES).forEach(labelTable);
    }

    function schedule() {
        if (queued) return;
        queued = true;
        setTimeout(labelAll, 30);   // a timer (not requestAnimationFrame) so it also runs in background tabs
    }

    function start() {
        labelAll();
        if (window.MutationObserver) {
            // rows are replaced whenever a list is redrawn; only structure changes matter (labels are attributes)
            new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
