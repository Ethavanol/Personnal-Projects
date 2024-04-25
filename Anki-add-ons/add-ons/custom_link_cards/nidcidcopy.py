from aqt.qt import QApplication
from aqt.utils import tooltip
from .config import gc


def nidcopy(nid):
    prefix = ""
    if gc("browser_table_add_prefix_when_copying", True):
        prefix += gc("prefix_nid", "nidd")
    QApplication.clipboard().setText(prefix + str(nid))


# def cidcopy(cid):
#     prefix = ""
#     if gc("browser_table_add_prefix_when_copying", True):
#         prefix += gc("prefix_cid", "cidd")
#     QApplication.clipboard().setText(prefix + str(cid))


def rectocidcopy(card):
    if card.id:
        prefix = ""
        if gc("browser_table_add_prefix_when_copying", True):
            prefix += gc("prefix_cid", "cidd")
        cid = prefix + str(card.id)
        recto = card.note()['Recto']
        QApplication.clipboard().setText(str(recto) + ' - ' + str(cid))
    else:
        tooltip('La carte d\'id '+card.id+' n\'existe pas')
