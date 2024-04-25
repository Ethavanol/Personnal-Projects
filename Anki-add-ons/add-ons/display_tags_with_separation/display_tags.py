from anki import hooks
from anki.template import TemplateRenderContext


def on_field_filter(text, field, filter, context: TemplateRenderContext):
    if filter != 'Tags':
        return text

    newText = ""
    for tag in context.fields()["Tags"].split():
        newText += tag + " - "

    newText = newText[:-3]
    return newText


hooks.field_filter.append(on_field_filter)


