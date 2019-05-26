var filters = document.getElementById('leaderboard').getElementsByTagName('a');
var deadFiltered = false;

function allRows(hide) {
    var rows = document.getElementById('leaderboard').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = hide || (deadFiltered && rows[i].className.indexOf('dead') != -1) ? 'none' : '';
    }
}

function showRowsForClass(classname) {
    var rows = document.getElementById('leaderboard').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    if (deadFiltered)
        classname = classname + " alive";
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
        allRows(true);
        switch(this.getAttribute('id')) {
            case 'all-filter':
                allRows(false);
                highlightButton(this);
                break;
            case 'dead-filter':
                deadFiltered = !deadFiltered;
                if (deadFiltered)
                    this.innerText = "Show Dead Characters"
                else
                    this.innerText = "Hide Dead Characters"
                allRows(false);
                break;
            default:
                showRowsForClass(this.getAttribute('id').substring(0,this.getAttribute('id').indexOf('-')));
                highlightButton(this);
                break;
        }
    });
}


