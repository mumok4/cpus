
document.addEventListener('DOMContentLoaded', () => {
    const tableHead = document.querySelector('#cpuTable thead');
    const tableBody = document.querySelector('#cpuTable tbody');
    const searchInput = document.getElementById('searchInput');
    const manufacturerFilter = document.getElementById('manufacturerFilter');
    const platformFilter = document.getElementById('platformFilter');
    const coresFilter = document.getElementById('coresFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');

    let cpuData = [];
    let currentSort = { column: null, direction: 'asc' };

    function populateFilters() {
        const manufacturers = [...new Set(cpuData.map(cpu => cpu.Manufacturer))];
        const platforms = [...new Set(cpuData.map(cpu => cpu.Platform))];
        const cores = [...new Set(cpuData.map(cpu => cpu.Cores))].sort((a, b) => a - b);

        manufacturers.forEach(m => manufacturerFilter.add(new Option(m, m)));
        platforms.forEach(p => platformFilter.add(new Option(p, p)));
        cores.forEach(c => coresFilter.add(new Option(`${c} ядер`, c)));
    }

    function applyAllFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedManufacturer = manufacturerFilter.value;
        const selectedPlatform = platformFilter.value;
        const selectedCores = coresFilter.value;

        let filteredData = cpuData.filter(cpu => {
            const modelAsString = String(cpu.Model || '');
            const matchesSearch = modelAsString.toLowerCase().includes(searchTerm);

            const matchesManufacturer = !selectedManufacturer || cpu.Manufacturer === selectedManufacturer;
            const matchesPlatform = !selectedPlatform || cpu.Platform === selectedPlatform;
            const matchesCores = !selectedCores || cpu.Cores == selectedCores;

            return matchesSearch && matchesManufacturer && matchesPlatform && matchesCores;
        });

        if (currentSort.column) {
            filteredData.sort((a, b) => {
                const valA = a[currentSort.column];
                const valB = b[currentSort.column];

                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    const strA = String(valA).toLowerCase();
                    const strB = String(valB).toLowerCase();
                    if (strA > strB) comparison = 1;
                    else if (strA < strB) comparison = -1;
                }

                return currentSort.direction === 'asc' ? comparison : -comparison;
            });
        }

        renderTable(filteredData);
    }

    function resetFilters() {
        searchInput.value = '';
        manufacturerFilter.value = '';
        platformFilter.value = '';
        coresFilter.value = '';
        currentSort = { column: null, direction: 'asc' };
        applyAllFiltersAndSort();
    }


    function sanitizeHeaderForClassName(header) {
        return header.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function renderTable(data) {
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="11">Процессоры не найдены.</td></tr>`;
            return;
        }

        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.className = `header-${sanitizeHeaderForClassName(headerText)} sortable`;
            th.textContent = headerText;
            th.dataset.column = headerText;

            if (currentSort.column === headerText) {
                th.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }

            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);

        data.forEach(cpu => {
            const row = document.createElement('tr');
            row.className = 'cpu-row';
            row.dataset.manufacturer = cpu.Manufacturer;
            row.dataset.model = cpu.Model;
            headers.forEach(header => {
                const cell = document.createElement('td');
                const cellClass = `cpu-${sanitizeHeaderForClassName(header)}`;
                cell.className = `cpu-data ${cellClass}`;
                cell.textContent = cpu[header];
                if (header === 'Manufacturer') cell.dataset.manufacturer = cpu[header];
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    }

    searchInput.addEventListener('input', applyAllFiltersAndSort);
    manufacturerFilter.addEventListener('change', applyAllFiltersAndSort);
    platformFilter.addEventListener('change', applyAllFiltersAndSort);
    coresFilter.addEventListener('change', applyAllFiltersAndSort);
    resetFiltersBtn.addEventListener('click', resetFilters);

    tableHead.addEventListener('click', e => {
        const th = e.target.closest('th');
        if (!th || !th.classList.contains('sortable')) return;

        const column = th.dataset.column;

        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }

        applyAllFiltersAndSort();
    });

});
