import json

from aqt import gui_hooks
from aqt.browser import Browser
from aqt.editcurrent import EditCurrent
from aqt.editor import Editor
from aqt.qt import QApplication
from aqt.utils import (
    getText,
    tooltip,
)


from .anki_version_detection import anki_point_version
from .config import gc, pycmd_card, pycmd_card_internal, pycmd_nid, pycmd_nid_internal
from .helpers import note_has_backlinks, open_backlinks_in_browser
from .nidcidcopy import nidcopy, rectocidcopy



def append_js_to_Editor(web_content, context):
    if not gc("editor double click to open nidd/cidd"):
        return
    if not isinstance(context, Editor):
        return    
    script_str = """
<script>
var nidd_cidd_regex = new RegExp("((NIDPREFIX|CIDPREFIX)\\\\d{13})");
window.addEventListener('dblclick', function (e) {
    const st = window.getSelection().toString();
    if (st != ""){
        if (nidd_cidd_regex.test(st)){
            pycmd(st);
        }
    }
});
</script>
""".replace("NIDPREFIX", gc("prefix_nid"))\
   .replace("CIDPREFIX", gc("prefix_cid"))
    web_content.head += script_str
gui_hooks.webview_will_set_content.append(append_js_to_Editor)

def js_inserter_after_load(self):
    jsstring = """

"""
    self.web.eval(jsstring)
# gui_hooks.editor_did_init.append(js_inserter_after_load)



dddd = {
    # "AddCards": AddCards,  # never worked for cids, doesn't work for nids in 2.1.28+
    "Browser": Browser,
    "EditCurrent": EditCurrent,  # doesn't hold card/cid
}
if anki_point_version <= 49:
    from .note_edit import EditNoteWindowFromThisLinkAddonUpTo49
    dddd["EditNoteWindowFromThisLinkAddon"] = EditNoteWindowFromThisLinkAddonUpTo49
elif anki_point_version <= 66:
    from .note_edit import EditCurrentModFor50_to_66
    dddd["EditNoteWindowFromThisLinkAddon"] = EditCurrentModFor50_to_66
else:
    from .note_edit import EditCurrentModFor2310_or_later
    dddd["EditNoteWindowFromThisLinkAddon"] = EditCurrentModFor2310_or_later


# Advanced Browser since .45 (the anki version that merged rumo's browser rewrite) AB no longer
# overwrites Browser but patches it - see the commits after 
# https://github.com/ankipalace/advanced-browser/commit/01cb415ab42da01d2ca36a75a503ce1607fea59f )
if anki_point_version <= 44:
    try:
        AdvancedBrowser = __import__("874215009").advancedbrowser.core.AdvancedBrowser
    except:
        pass
    else:
        dddd["Browser"] = AdvancedBrowser


def paste_nidd_cidd_hyperlink(editor, is_nid):
    clip_txt = QApplication.clipboard().text()
    if not len(clip_txt) == 13 and clip_txt.isdigit():
        tooltip('not a 13digit number. Aborting ...')
        return
    label, ok = getText(
        prompt="Enter text for nid/cid link:",
        default=gc("Default link text", "(lnk)")
        )
    if not ok:
        return
    cmd = pycmd_nid if is_nid else pycmd_card
    cmd = pycmd_nid_internal if is_nid else pycmd_card_internal
    # a href doesn't work in the editor.
    text = f"""<a onclick="pycmd('{cmd}{clip_txt}');">{label}</a>"""
    editor.web.eval(f"document.execCommand('insertHTML', false, {json.dumps(text)});")


def add_to_context(view, menu):
    editor = view.editor
    parent = editor.parentWindow
    st = gc("editor context menu show note-id (nid) copy entries in", [])
    cs = []
    for entry in st:
        cs.append(dddd.get(entry))
    # if there's something invalid in the config dddd.get() might return None which breaks isinstance
    cs = [e for e in cs if e is not None]
    nid_showin = tuple(cs)
    if isinstance(parent, nid_showin):
        a = menu.addAction("Copy nid")
        a.triggered.connect(lambda _, nid=editor.note.id: nidcopy(nid))
    if isinstance(parent, Browser) and gc("editor context menu show card-id (cid) copy entries in Browser"):
        a = menu.addAction("Copy cid")
        a.triggered.connect(lambda _, card=parent.card: rectocidcopy(card))
    if gc("Paste Hyperlinks into note instead of nidd or cidd string", False):
        a = menu.addAction("Paste stored note-id link")
        a.triggered.connect(lambda _, ed=editor: paste_nidd_cidd_hyperlink(editor=ed, is_nid=True))
        a = menu.addAction("Paste stored card-id link")
        a.triggered.connect(lambda _, ed=editor: paste_nidd_cidd_hyperlink(editor=ed, is_nid=False))
    # backlinks
    has_backlinks = note_has_backlinks(editor.note)
    if has_backlinks:
        a = menu.addAction("Open backlinks")
        a.triggered.connect(lambda _, c=has_backlinks[0],n=has_backlinks[1]: open_backlinks_in_browser(c,n))
gui_hooks.editor_will_show_context_menu.append(add_to_context)
