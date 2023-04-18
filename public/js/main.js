document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // 配置する要素の生成・配置
    createForm();
    createTable();
    createAddRowButton();
    createPieChart();

    // イベントリスナーの追加
    addEventListeners();
}

function createForm() {
    // budgetフォームの生成・配置
    const budgetForm = document.createElement('form');
    budgetForm.id = 'budget-form';

    const budgetLabel = document.createElement('label');
    budgetLabel.htmlFor = 'budget';
    budgetLabel.innerText = '掛け金の上限:';

    const budgetInput = document.createElement('input');
    budgetInput.type = 'number';
    budgetInput.id = 'budget';
    budgetInput.name = 'budget';
    budgetInput.min = 0;
    budgetInput.step = 1;
    budgetInput.required = true;
    budgetInput.value = 1000;

    budgetForm.appendChild(budgetLabel);
    budgetForm.appendChild(budgetInput);

    document.body.appendChild(budgetForm);
}


function createTable() {
    // synthetic-oddsの生成・配置
    const syntheticOddsDiv = document.createElement('div');
    syntheticOddsDiv.id = 'synthetic-odds';
    syntheticOddsDiv.innerText = '合成オッズ: 0.00';
    document.body.appendChild(syntheticOddsDiv);

    // tableの生成・配置
    const table = document.createElement('table');
    table.id = 'ticket-table';

    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Ticket', 'Combination', 'Odds', 'Bet', 'Payback'].forEach(column => {
        const th = document.createElement('th');
        th.innerText = column;
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    table.appendChild(header);

    const body = document.createElement('tbody');
    for (let i = 0; i < 10; i++) {
        const row = createTableRow();
        body.appendChild(row);
    }
    table.appendChild(body);

    document.body.appendChild(table);
}

function createTableRow() {
    // 1行分の要素を生成
    const row = document.createElement('tr');

    // Ticket列
    const ticketCell = document.createElement('td');
    const ticketSelect = document.createElement('select');
    ['単勝', '複勝', 'ワイド', '馬連', '馬単', '三連複', '三連単'].forEach(ticketType => {
        const option = document.createElement('option');
        option.value = ticketType;
        option.innerText = ticketType;
        ticketSelect.appendChild(option);
    });
    ticketCell.appendChild(ticketSelect);
    row.appendChild(ticketCell);

    // Combination列
    const combinationCell = document.createElement('td');
    const combinationInput = document.createElement('input');
    combinationInput.type = 'text';
    combinationCell.appendChild(combinationInput);
    row.appendChild(combinationCell);

    // Odds列
    const oddsCell = document.createElement('td');
    const oddsInput = document.createElement('input');
    oddsInput.type = 'number';
    oddsInput.min = 0;
    oddsInput.step = 0.01;
    oddsCell.appendChild(oddsInput);
    row.appendChild(oddsCell);

    // Bet列
    const betCell = document.createElement('td');
    const betInput = document.createElement('input');
    betInput.type = 'number';
    betInput.min = 0;
    betInput.step = 1;
    betInput.disabled = true;
    betCell.appendChild(betInput);
    row.appendChild(betCell);

    // Payback列
    const paybackCell = document.createElement('td');
    const paybackInput = document.createElement('input');
    paybackInput.type = 'number';
    paybackInput.min = 0;
    paybackInput.step = 1;
    paybackInput.disabled = true;
    paybackCell.appendChild(paybackInput);
    row.appendChild(paybackCell);

    return row;
}


function createPieChart() {
    const pieChartDiv = document.createElement('div');
    pieChartDiv.id = 'pie-chart';

    document.body.appendChild(pieChartDiv);

    const data = [{
        values: [],
        labels: [],
        textinfo: 'percent',
        hovertemplate: '%{customdata}<extra></extra>',
        type: 'pie'
    }];

    const layout = {
        title: 'Bet Portfolio',
        height: 400,
        width: 400
    };

    Plotly.newPlot('pie-chart', data, layout);
}

function createAddRowButton() {
    const addButton = document.createElement('button');
    addButton.id = 'add-row-button';
    addButton.innerText = '行を追加';

    addButton.addEventListener('click', event => {
        event.preventDefault();
        addNewRow();
    });

    document.body.appendChild(addButton);
}

function addNewRow() {
    const table = document.getElementById('ticket-table');
    const body = table.querySelector('tbody');
    const newRow = createTableRow();
    body.appendChild(newRow);
}


function addEventListeners() {
    // budgetの入力値が変更されたとき
    const budgetInput = document.getElementById('budget');
    budgetInput.addEventListener('change', updateTable);

    // table内の入力値が変更されたとき
    const table = document.getElementById('ticket-table');
    table.addEventListener('change', event => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
            updateTable();
        }
    });
}


function calculateSyntheticOdds(oddsList) {
    if (oddsList.length === 0) {
        return 0;
    }

    let oddsSumInverse = 0;
    oddsList.forEach(odds => {
        oddsSumInverse += 1 / odds;
    });

    const syntheticOdds = 1 / oddsSumInverse;
    return syntheticOdds;
}


function calculateBet(odds, syntheticOdds, budget) {
    const bet = budget * syntheticOdds / odds;
    return Math.round(bet / 100) * 100;
}


function calculatePayback(bet, odds) {
    const payback = bet * odds;
    return payback;
}


function updateTable() {
    const budget = parseFloat(document.getElementById('budget').value);
    const table = document.getElementById('ticket-table');
    const rows = table.querySelectorAll('tbody tr');

    let oddsList = [];
    rows.forEach(row => {
        const oddsInput = row.querySelector('td:nth-child(3) input');
        const odds = parseFloat(oddsInput.value);
        if (!isNaN(odds) && odds > 0) {
            oddsList.push(odds);
        }
    });

    const syntheticOdds = calculateSyntheticOdds(oddsList);

    // Update synthetic odds display
    const syntheticOddsDiv = document.getElementById('synthetic-odds');
    syntheticOddsDiv.innerText = `合成オッズ: ${syntheticOdds.toFixed(2)}`;

    rows.forEach(row => {
        const oddsInput = row.querySelector('td:nth-child(3) input');
        const odds = parseFloat(oddsInput.value);

        if (!isNaN(odds) && odds > 0 && !isNaN(budget) && budget > 0) {
            const betInput = row.querySelector('td:nth-child(4) input');
            const bet = calculateBet(odds, syntheticOdds, budget);
            betInput.value = bet.toFixed(0);

            const paybackInput = row.querySelector('td:nth-child(5) input');
            const payback = calculatePayback(bet, odds);
            paybackInput.value = payback.toFixed(0);
        }
    });

    updatePieChart();
}


function updatePieChart() {
    const table = document.getElementById('ticket-table');
    const rows = table.querySelectorAll('tbody tr');

    let betValues = [];
    let labels = [];
    let hoverTexts = [];

    rows.forEach((row, index) => {
        const ticketSelect = row.querySelector('td:nth-child(1) select');
        const ticketType = ticketSelect.value;

        const combinationInput = row.querySelector('td:nth-child(2) input');
        const combination = combinationInput.value;

        const oddsInput = row.querySelector('td:nth-child(3) input');
        const odds = parseFloat(oddsInput.value);

        const betInput = row.querySelector('td:nth-child(4) input');
        const bet = parseFloat(betInput.value);

        if (!isNaN(bet) && bet > 0) {
            betValues.push(bet);
            labels.push(`${ticketType} ${combination}`);

            // hoverTexts配列にテキストを追加
            hoverTexts.push(`${ticketType} ${combination}<br>Odds: ${odds}<br>Bet: ${bet}<br>Payback: ${bet * odds}`);
        }
    });

    const data = [{
        values: betValues,
        labels: labels,
        textinfo: 'percent',
        hovertemplate: '%{customdata}<extra></extra>',
        customdata: hoverTexts,
        type: 'pie'
    }];

    const layout = {
        title: 'Bet Portfolio',
        height: 400,
        width: 400
    };

    Plotly.react('pie-chart', data, layout);
}
