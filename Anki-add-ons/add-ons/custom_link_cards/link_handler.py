import aqt
from aqt import mw

from .anki_version_detection import anki_point_version
from .config import gc, pycmd_card, pycmd_card_internal, pycmd_nid, pycmd_nid_internal

from .card_window import check_cid
from .note_edit import check_nid

def process_urlcmd(url):
    # print(f"in process_urlcmd, pycmd_nid is {pycmd_nid} and url is {url}")
    if url.startswith(pycmd_card_internal):
        cid = url.lstrip(pycmd_card_internal)
        if check_cid(cid):
            return True
    elif url.startswith(pycmd_nid_internal):
        nid = url.lstrip(pycmd_nid_internal)
        if check_nid(nid):
            return True

    elif url.startswith(pycmd_card):
        cid = url.lstrip(pycmd_card)
        if check_cid(cid):
            return True
    elif url.startswith(pycmd_nid):
        nid = url.lstrip(pycmd_nid)
        if check_nid(nid):
            return True
    
    return False

