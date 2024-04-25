import datetime
import re
import time

from aqt import mw
from aqt.qt import (
    QAction,
    QMenu,
)

from .anki_version_detection import anki_point_version
from .config import link_menu, gc, wc


def make_back_link_dict(nid_list, is_note):
    if is_note:
        regex = r"""(?<=%s)(\d{13})""" % gc("prefix_nid", "nidd")
    else:
        regex = r"""(?<=%s)(\d{13})""" % gc("prefix_cid", "cidd")
    ro = re.compile(regex)
    out_dict = {}
    missing_notes = []
    missing_cards = []
    for nid in nid_list:
        outlist = []
        missing = False
        try:
            note = mw.col.getNote(int(nid)) if anki_point_version <= 49 else mw.col.get_note(int(nid))
        except:
            missing_notes.append[nid]
        else:
            model = note.note_type()
            idx_to_ignore = None
            for f in model["flds"]:
                if f["name"] == gc("back link field name (will be overwritten), no space, no special chars"):
                    idx_to_ignore = f["ord"]
            for idx, f in enumerate(note.fields):
                if idx == idx_to_ignore:
                    continue
                mo = ro.search(f)
                if mo:
                    id = mo.groups()[0]
                    if not is_note:
                        try:
                            card = mw.col.get_card(int(id))
                        except:
                            missing_cards.append(id)
                            missing = True
                        else:
                            id = str(card.nid)
                    if not missing:
                        if id not in out_dict:
                            out_dict[id] = []
                        if str(note.id) not in out_dict[id]:
                            out_dict[id].append(str(note.id))
    return out_dict


def merge_and_format(id_list):
    out = ""
    prefix = gc("prefix_nid", "nidd")
    for nid in id_list:
        out += f"{prefix}{nid}<br>"
    if not out:
        return out
    return out[:-4]


def create_backlinks(dic_target_to_linked):
    for nid, dest_list in dic_target_to_linked.items():
        try:
            note = mw.col.getNote(int(nid)) if anki_point_version <= 49 else mw.col.get_note(int(nid))
        except:
            continue
        else:
            model = note.note_type()
            dict_fname_to_fidx = {f["name"]: f["ord"] for f in model["flds"]}
            for fname, fidx in dict_fname_to_fidx.items():
                if fname == gc("back link field name (will be overwritten), no space, no special chars"):
                    note.fields[fidx] = merge_and_format(dest_list)
            note.flush()


def update_notes(time_limit=""):
    term = "re:%s\d{13} %s" % (gc("prefix_cid", "cidd"), time_limit)
    notes_with_cid_refs = mw.col.find_notes(term)
    dict__cids__target_nid__to__list_with_nids = make_back_link_dict(notes_with_cid_refs, is_note=False)

    term = "re:%s\d{13} %s" % (gc("prefix_nid", "nidd"), time_limit)
    notes_with_NID_refs = mw.col.find_notes(term)
    dict__NIDS__target_nid__to__list_with_nids = make_back_link_dict(notes_with_NID_refs, is_note=True)

    merge_dict = {}
    for key, val in dict__cids__target_nid__to__list_with_nids.items():
        merge_dict[key] = val
    for key, val in dict__NIDS__target_nid__to__list_with_nids.items():
        if key in merge_dict:
            new = merge_dict[key] + val
            merge_dict[key] = list(set(new))
        if key not in merge_dict:
            merge_dict[key] = val

    create_backlinks(merge_dict)


def update_only_recent():
    last_run = gc("back links last time run", 0)
    old = datetime.datetime.fromtimestamp(last_run)
    now = datetime.datetime.now()
    delta = now - old
    update_notes(time_limit=f"edited:{delta.days+1}")
    last_run_in_epoch = int(time.time())
    wc("back links last time run", last_run_in_epoch)


def update_all_notes():
    update_notes()


# not need on my computer => untested
# action_recent = QAction("Fill back link field for recently changed", mw)
# action_recent.triggered.connect(update_only_recent)
# link_menu.addAction(action_recent)

action_all = QAction("Fill back link field for ALL notes (may be slow!)", mw)
action_all.triggered.connect(update_all_notes)
link_menu.addAction(action_all)
