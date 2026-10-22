# ponytail: field list is hardcoded; payload is stored as JSON so old
# submissions keep their own snapshot. Every field is required — the business
# rule is "no blanks". csv: labels become the CSV header (in order).
FORM_PATH = "pedsostav"

SPECIALTIES = [
    "09.02.07 Информационные системы и программирование",
    "40.02.02 Правоохранительная деятельность",
    "43.02.10 Туризм",
    "44.02.01 Дошкольное образование",
    "44.02.02 Преподавание в начальных классах",
    "44.02.05 Коррекционная педагогика в начальном образовании",
    "10.02.01 Организация и технология защиты информации",
    "43.02.14 Гостиничное дело",
    "44.02.03 Педагогика дополнительного образования",
    "43.02.16 Туризм и гостеприимство",
    "38.02.08 Торговое дело",
    "16199 Оператор электронно-вычислительных и вычислительных машин",
    "16909 Портной",
]

FIELDS = [
    {"key": "full_name", "label": "ФИО", "type": "text", "required": True, "placeholder": "Иванов Иван Иванович"},
    {"key": "position", "label": "Занимаемая должность", "type": "text", "required": True, "placeholder": "Преподаватель"},
    {"key": "education_level", "label": "Уровень образования", "type": "text", "required": True, "placeholder": "Высшее, СПО и т. д."},
    {
        "key": "training_area",
        "label": "Наименование направления подготовки и (или) специальности",
        "type": "text",
        "required": True,
        "placeholder": "Направление подготовки по диплому",
    },
    {
        "key": "specialties",
        "label": "Код и наименование профессии/специальности",
        "type": "specialties",
        "required": True,
        "options": SPECIALTIES,
        "hint": "Можно выбрать несколько",
    },
    {
        "key": "subjects",
        "label": "Преподаваемые учебные предметы, курсы, дисциплины (модули)",
        "type": "list",
        "required": True,
        "placeholder": "Математика, информатика, информационные технологии",
        "hint": "Перечислите через запятую",
    },
    {"key": "position_experience", "label": "Опыт работы в должности", "type": "text", "required": True, "placeholder": "Например, 5 лет"},
    {"key": "category", "label": "Категория", "type": "text", "required": True, "placeholder": "Первая, высшая"},
    {"key": "total_experience", "label": "Общий стаж", "type": "text", "required": True, "placeholder": "Например, 12 лет"},
    {"key": "teaching_experience", "label": "Педагогический стаж", "type": "text", "required": True, "placeholder": "Например, 10 лет"},
    {
        "key": "training",
        "label": "Повышение квалификации",
        "type": "textarea",
        "required": True,
        "placeholder": "Курс, организация, год — по одному на строку или через запятую",
        "hint": "Перечислите через запятую",
    },
    {
        "key": "retraining",
        "label": "Переподготовка",
        "type": "textarea",
        "required": True,
        "placeholder": "Программа, организация, год",
        "hint": "Перечислите через запятую",
    },
    {
        "key": "degrees",
        "label": "Учёная степень",
        "type": "textarea",
        "required": True,
        "placeholder": "Например, кандидат педагогических наук",
        "hint": "Перечислите через запятую",
    },
    {
        "key": "titles",
        "label": "Учёное звание",
        "type": "textarea",
        "required": True,
        "placeholder": "Например, доцент",
        "hint": "Перечислите через запятую",
    },
    {
        "key": "internship",
        "label": "Стажировка",
        "type": "textarea",
        "required": True,
        "placeholder": "Организация, период, тема",
        "hint": "Перечислите через запятую",
    },
]
