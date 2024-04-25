from aqt import mw
from aqt.qt import QMenu, Qt


def gc(arg, fail=False):
    conf = mw.addonManager.getConfig(__name__.split(".")[0])
    if conf:
        return conf.get(arg, fail)
    else:
        return fail


def wc(key, new_value, add_new=False):
    config = mw.addonManager.getConfig(__name__)
    if not (key in config or add_new):
        return False
    else:
        config[key] = new_value
        mw.addonManager.writeConfig(__name__, config)
        return True


link_menu = QMenu("Link notes/cards ...", mw)
mw.form.menuTools.addMenu(link_menu)


pycmd_card = gc("prefix_cid")  # "card_in_extra_window"
pycmd_nid = gc("prefix_nid")  # "note_in_extra_window"

pycmd_card_internal = "1423933177_cidd_"
pycmd_nid_internal = "1423933177_nidd_"


def shift_down():
    return mw.app.keyboardModifiers() & Qt.KeyboardModifier.ShiftModifier


def ctrl_down():
    return mw.app.keyboardModifiers() & Qt.KeyboardModifier.ControlModifier


def alt_down():
    return mw.app.keyboardModifiers() & Qt.KeyboardModifier.AltModifier


def meta_down():
    return mw.app.keyboardModifiers() & Qt.KeyboardModifier.MetaModifier