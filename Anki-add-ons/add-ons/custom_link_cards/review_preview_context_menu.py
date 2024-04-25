from anki.hooks import addHook

from aqt.gui_hooks import webview_will_show_context_menu
import aqt
from aqt.qt import *

from .card_window import SingleCardPreviewerMod
from .helpers import note_has_backlinks, open_backlinks_in_browser
from .nidcidcopy import rectocidcopy, nidcopy


def shortcut_helper_nid__reviewer():
    if aqt.mw.reviewer.card.nid:
        nidcopy(aqt.mw.reviewer.card.nid)


def shortcut_helper_cid__reviewer():   
    if aqt.mw.reviewer.card:
        rectocidcopy(aqt.mw.reviewer.card)


def shortcut_helper_nid__browser_previewer(view, previewer):
    nid = previewer.card().nid
    if nid:
        nidcopy(nid)


def shortcut_helper_cid__browser_previewer(view, previewer):
    card = previewer.card()
    if card:
        rectocidcopy(card)


def reviewer_previewer_context_menu(webview, menu):
    parent = webview.parent()
    already_added = False

    # webview.title == previewer might be dangerous since some classes in the previewer
    # don't have the method card()
    if isinstance(parent, (aqt.browser.previewer.BrowserPreviewer,SingleCardPreviewerMod)):
        menutext = "Copy nid"
        action_nid = menu.addAction(menutext)
        qconnect(action_nid.triggered, lambda _, v=webview,p=parent:shortcut_helper_nid__browser_previewer(v,p))

        menutext = "Copy cid"
        action_cid = menu.addAction(menutext)
        qconnect(action_cid.triggered, lambda _, v=webview,p=parent:shortcut_helper_cid__browser_previewer(v,p))
        already_added = True

        # backlinks
        has_backlinks = note_has_backlinks(parent.card().note())
        if has_backlinks:
            menutext = "Open backlinks in browser"
            action_backlinks = menu.addAction(menutext)
            qconnect(action_backlinks.triggered, lambda _, c=has_backlinks[0],n=has_backlinks[1]: open_backlinks_in_browser(c,n)) 

    # https://forums.ankiweb.net/t/how-to-use-gui-hooks-reviewer-will-show-context-menu/21423/2
    # glutanimate calls "webview.title == "main webview":" shaky
    if aqt.mw.state == "review" and not already_added:
        menutext = "Copy nid"
        action_nid = menu.addAction(menutext)
        qconnect(action_nid.triggered, shortcut_helper_nid__reviewer)

        menutext = "Copy cid"
        action_cid = menu.addAction(menutext)
        qconnect(action_cid.triggered, shortcut_helper_cid__reviewer)  

        # backlinks
        has_backlinks = note_has_backlinks(aqt.mw.reviewer.card.note())
        if has_backlinks:
            menutext = "Open backlinks in browser"
            action_backlinks = menu.addAction(menutext)
            qconnect(action_backlinks.triggered, lambda _, c=has_backlinks[0],n=has_backlinks[1]: open_backlinks_in_browser(c,n))  

# note: reviewer_will_show_context_menu hook doesn't help since it calls the More-Button menu
# and not the right click menu.
webview_will_show_context_menu.append(reviewer_previewer_context_menu)
