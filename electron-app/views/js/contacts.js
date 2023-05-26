
function test(name) {
    if (document.getElementById("searchbar").value == name) {
        alert('Tu ne peux te rechercher toi même');
        document.getElementById("searchbar").value = "";
        return false;
    } else {
        return true;
    }
}

