from anki.hooks import addHook
from aqt import mw

def addCartesLieesModel():
    #ajoute un champ CartesLiees au model
    model = mw.col.models.current()
    already_exists = False
    size = 0
    for field in model['flds']:
        size += 1
        if field['name'] == 'CartesLiees':
            already_exists = True

    if not already_exists:
        model['flds'].append({'name': 'CartesLiees', 'ord': size, 'sticky': False, 'rtl': False, 'font': 'Arial', 'size': 20, 'description': '', 'plainText': False, 'collapsed': False, 'excludeFromSearch': False, 'id': 99999999999, 'tag': None, 'preventDeletion': False})
        mw.col.models.save(model)


# Hook pour exécuter la fonction addDefaultModel lorsque Anki est lancé
addHook("profileLoaded", addCartesLieesModel)
