import { createForm, createTable, createPieChart, createAddRowButton } from './createElements.js'

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
