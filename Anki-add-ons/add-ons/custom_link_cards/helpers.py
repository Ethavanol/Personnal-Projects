import re

import aqt

from .anki_version_detection import anki_point_version
from .config import gc
from aqt.utils import showInfo


def note_has_backlinks(note):
    model = note.model() if anki_point_version <= 49 else note.note_type()
    cid_list = []
    note_list = []
    for f in model["flds"]:
        if f["name"] == gc("back link field name (will be overwritten), no space, no special chars"):
            text = note.fields[f["ord"]]
            regex_card = r"""%s(\d{13})""" % "cidd"
            ro_card = re.compile(regex_card)
            cid_list = ro_card.findall(text)
            regex_note = r"""%s(\d{13})""" % "nidd"
            ro_note = re.compile(regex_note)
            note_list = ro_note.findall(text)
    return cid_list, note_list


def open_backlinks_in_browser(cid_list, nid_list):
    showInfo('test')
    q1 = f"""cid:{','.join([str(x) for x in cid_list])}""" if cid_list else ""
    q2 = f"""nid:{','.join([str(x) for x in nid_list])}""" if nid_list else ""
    query = f"{q1} {'OR' if q1 and q2 else ''} {q2}"
    browser = aqt.dialogs.open("Browser", aqt.mw)
    browser.form.searchEdit.lineEdit().setText(query)
    browser.onSearchActivated()
