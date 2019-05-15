var filters = document.getElementById('leaderboard').getElementsByTagName('a');

function showAllRows() {
    var rows = document.getElementById('leaderboard').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
}

function hideAllRows() {
    var rows = document.getElementById('leaderboard').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
}

function showRowsForClass(classname) {
    var rows = document.getElementById('leaderboard').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        if(rows[i].className.indexOf(classname) != -1)
            rows[i].style.display = '';
    }
}

function highlightButton(element) {
    for (var i = 0; i < filters.length; i++) {
        filters[i].className = '';
    }
    element.className = 'selected';
}

for (var i = 0; i < filters.length; i++) {
    filters[i].addEventListener('click',function(){
        highlightButton(this);
        hideAllRows();
        switch(this.getAttribute('id')) {
            case 'all-filter':
            showAllRows();
            break;
            case 'warrior-filter':
            showRowsForClass('warrior');
            break;
            case 'paladin-filter':
            showRowsForClass('paladin');
            break;
            case 'hunter-filter':
            showRowsForClass('hunter');
            break;
            case 'rogue-filter':
            showRowsForClass('rogue');
            break;
            case 'priest-filter':
            showRowsForClass('priest');
            break;
            case 'shaman-filter':
            showRowsForClass('shaman');
            break;
            case 'mage-filter':
            showRowsForClass('mage');
            break;
            case 'warlock-filter':
            showRowsForClass('warlock');
            break;
            case 'druid-filter':
            showRowsForClass('druid');
            break;
        }
    });
}


