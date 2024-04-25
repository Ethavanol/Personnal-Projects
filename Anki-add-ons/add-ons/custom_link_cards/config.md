### hiding the note-id (nid) or card-id(cid) numbers
By default this add-on stores a reference to another note as plain text like "nidd1234567890123" in another note. Many people think this looks ugly. But I deliberately used this approach for three reasons:

- the current approach has been working for over three years. Introducing changes introduces new options for errors. This is especially relevant since I can't test on all Anki platforms. I neither have a Mac nor an iPhone and sometimes there are platform specific bugs.
- In early 2023 neither AnkiMobile for iOS nor Ankidroid for Android have full add-on support. This means that if I inserted the note-ids hidden in a clickable hyperlink it would be fully useless on mobile. Whereas visible note-/card-ids allow you to manually copy and paste them to the browser. It's cumbersome but at least it works. 
- If my add-on ever stops working with newer Anki versions your links will be useless unless you can transform the hidden text back to a visbile one. If you know some html and regular expressions it shouldn't be too hard. But do you? If not, you'd need to find someone else and maybe have to pay someone. In 2017 glutanimate had an add-on named [internal references](https://github.com/glutanimate/internal-references) for the old Anki 2.0. He never updated it to Anki 2.1. Only about four years later someone else loaded up a version [to ankiweb](https://ankiweb.net/shared/info/323026909).

There are two things you can do differently:

1. You could keep plain text like "nidd1234567890123" in your note but have it transformed to a shorter link like "(lnk)" only when you see your cards in the reviewer or previewer. You could do this by adding some javascript to each front and back template. Since I have too many note types and want to keep the plain text approach on mobile I have added the option `"Hide nidd-cidd string in reviewer-previewer, only show short link"` in the add-on settings. By setting it to `true` all nidd-cidd strings will be transformed to what you've set under `"Default link text"` why defaults to `(lnk)`. This doesn't change your notes and you can always enable or disable this setting to get back to the old behavior. I know that this approach has the limitation that you can't set custom text for each note/card linked.
2. [not implemented yet]
### other settings

- `"transform quoted for these notetypes"`: You can add note type (model) names or ids into this list. My add-on transforms entries like nidd1234567890123 into clickable hyperlinks in the reviewer and previewer. If in your card template you have a field in some javascript code using backticks like ``` var myfield = `{{fieldname}}` ``` this transformation from a simple string like nidd1234567890123 to a clickable hyperlink only works if you add your note type to this config key. Limitation: For these note types the transformation in fields that are not surrounded by backticks in your card template no longer works.

### technical note about a minor feature removed from my add-on

- The behavior of the Add dialog recently changed. In old Anki verisons until Spring 2020 when 
you opened an Add window Anki had already assigned a preliminary note-id (nid) to the note you 
were creating in the Add window. So in the past I could add a context menu entry "copy note-id"
into the Add window. But in Anki 2.1.28 there was a change and the note-id is only assigned 
after you click the "Add" button in the lower right of the Add window. For details see
[here](https://forums.ankiweb.net/t/assign-note-id-to-new-notes-in-addnote-window-revert-a-change-in-2-1-28/2354).
So setting "AddCards" for `editor context menu show note-id (nid) copy entries in` no longer has any
effect.


