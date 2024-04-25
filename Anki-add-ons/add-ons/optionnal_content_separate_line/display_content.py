from anki import hooks
from anki.template import TemplateRenderContext
from aqt import mw

def on_field_filter(text, field, filter, context: TemplateRenderContext):
    # Si le filtre ne contient pas optionnal
    if filter != "optionnal":
        return text

    # Récupérer la valeur du champ associé
    field_value = context.fields().get(field)

    if not field_value:
        return ""

    return "".join(
        [
            f"""<div>
                <hr style="margin-bottom: 20px">
                {text}
            </div>"""
        ]
    )


hooks.field_filter.append(on_field_filter)
