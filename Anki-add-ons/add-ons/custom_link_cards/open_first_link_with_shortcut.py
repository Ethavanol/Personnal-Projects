import re

from anki.hooks import wrap
from aqt.gui_hooks import (
    editor_did_init_shortcuts,
)
from aqt.reviewer import Reviewer

from .config import gc
from .card_window import check_cid
from .note_edit import check_nid


def open_first_link_from_content(content, note_prefix, card_prefix):
    first_match_group = None
    regex_note = r"""(?<=%s)(\d{13})""" % note_prefix
    ro_note = re.compile(regex_note)
    mo_note = ro_note.search(content)
    if mo_note:
        first_match_group = mo_note
        first_match_is_note = True
    regex_card = r"""(?<=%s)(\d{13})""" % card_prefix
    ro_card = re.compile(regex_card)
    mo_card = ro_card.search(content)
    if mo_card:
        if mo_card.start() < first_match_group.start():
            first_match_group = mo_card
            first_match_is_note = False
    if first_match_group:
        id = mo_note.groups()[0]
        print(first_match_is_note, id)
        if first_match_is_note:
            check_nid(id)
        else:
            check_cid(id)


def open_first_link_from_content_with_nid_cid_prefix(content):
    open_first_link_from_content(content, gc("prefix_nid", "nidd"), gc("prefix_cid", "cidd"))


def _editor_open_first_link(editor):
    for field in editor.note.fields:
        open_first_link_from_content(field)


def editor_open_first_link(editor):
    editor.saveNow(lambda e=editor: _editor_open_first_link(e))


def editor_setup_shortcuts(cuts, editor):
    scut = gc("shortcut: open first link")
    if scut:
        cuts.append((scut, lambda: editor_open_first_link(editor)))
editor_did_init_shortcuts.append(editor_setup_shortcuts)





def reviewer_open_first_link(reviewer):
    self = reviewer
    question = self.card.question()
    answer = self.card.answer()
    if self.state == "question":
        open_first_link_from_content(question, gc("prefix_nid", "nidd"), gc("prefix_cid", "cidd"))
    if self.state == "answer":
        open_first_link_from_content(question+answer, gc("prefix_nid", "nidd"), gc("prefix_cid", "cidd"))


def newShortcutKeys(self, _old):
    scut = gc("shortcut: open first link")
    if scut:
        return _old(self) + [
            (scut, lambda: reviewer_open_first_link(self)),
        ]
    else:
        return _old(self)
Reviewer._shortcutKeys = wrap(Reviewer._shortcutKeys, newShortcutKeys, "around")
