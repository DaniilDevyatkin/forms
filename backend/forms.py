from fields import FIELDS, FORM_PATH, SPECIALTIES  # noqa: F401

# Реестр форм сайта. Новая форма = новая запись: свой `path` (URL-сегмент,
# например /pedsostav), заголовок и список полей. Хранятся все в submissions
# с form_id = slug.
FORMS = [
    {
        "slug": "ped-sostav",
        "path": FORM_PATH,
        "title": "Форма Пед.Состав",
        "fields": FIELDS,
    },
]


def form_by_path(path: str):
    key = path.strip("/").lower()
    for form in FORMS:
        if form["path"].lower() == key:
            return form
    return None


def path_for_slug(slug: str) -> str:
    for form in FORMS:
        if form["slug"] == slug:
            return form["path"]
    return FORMS[0]["path"]
