export const surveys = [
  {
    id: "verrueckt-na-und-evaluation",
    title: 'Umfrage zum Workshop "Verrückt, na und!" (Februar 2026)',
    description:
      "Erinnere dich bitte an den Workshop und fülle die folgende Umfrage ehrlich aus. Die Eingaben sind anonym.",
    questions: [
      {
        id: "geschlecht",
        type: "singleChoice",
        label: "Ich bin ...",
        required: true,
        options: ["männlich", "weiblich", "divers", "möchte ich nicht sagen"],
      },
      {
        id: "alter_jahre",
        type: "text",
        label: "Ich bin ... Jahre alt",
        required: true,
        input: "short",
      },
      {
        id: "gesamtbewertung",
        type: "rating",
        label: "Wie war der Workshop für dich insgesamt?",
        required: true,
        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        id: "sicherheitsgefuehl",
        type: "singleChoice",
        label: "Hast du dich beim Workshop im Raum sicher gefühlt? (z.B. zum Zuhören, Fragen stellen)",
        required: true,
        options: ["ja, sehr sicher", "eher sicher", "eher unsicher", "sehr unsicher"],
      },
      {
        id: "wissen-verstehen",
        type: "matrix",
        title: "Bitte bewerte die folgenden Aussagen.",
        required: true,
        options: ["ja, sehr gut", "eher gut", "eher nicht", "gar nicht"],
        rows: [
          {
            id: "inhalten_folgen",
            label: "Konntest du den Inhalten des Workshops gut folgen?",
          },
          {
            id: "psychische_gesundheit_verstehen",
            label: "Ich verstehe jetzt besser, was psychische Gesundheit bedeutet.",
          },
          {
            id: "verstaendnis_betroffene",
            label: "Ich weiß jetzt besser, wie es jemandem mit psychischen Problemen gehen kann.",
          },
          {
            id: "warnzeichen_kennen",
            label: "Ich kenne jetzt Warnzeichen, wenn es jemandem seelisch schlecht geht.",
          },
          {
            id: "hilfewege_kennen",
            label: "Ich weiß jetzt besser, wie und wo man professionelle Hilfe bekommen kann.",
          },
        ],
      },
      {
        id: "haltung-einstellung",
        type: "matrix",
        title: "Wie sehr stimmst du den folgenden Aussagen zu?",
        required: true,
        options: [
          "stimme ich voll zu",
          "stimme ich eher zu",
          "stimme ich eher nicht zu",
          "stimme ich gar nicht zu",
        ],
        rows: [
          {
            id: "schule_sollte_sprechen",
            label: "Ich finde, über psychische Gesundheit sollte man in der Schule sprechen.",
          },
          {
            id: "weniger_angst",
            label: "Ich habe jetzt weniger Angst, über eigene Probleme zu sprechen.",
          },
          {
            id: "weniger_vorurteile",
            label: "Ich habe jetzt weniger Vorurteile gegenüber Menschen mit psychischen Krisen.",
          },
          {
            id: "gruppenarbeit_hilfreich",
            label: "Ich würde in der Schule gern mehr über psychische Gesundheit lernen.",
          },
        ],
      },
      {
        id: "verrueckt_workshop_zukunft",
        type: "singleChoice",
        label: "Sollte die Schule diesen Workshop auch für die nächsten Klassen anbieten?",
        required: true,
        options: ["ja, auf jeden Fall", "eher ja", "eher nein", "nein, lieber etwas anderes suchen"],
      },
      {
        id: "geschichte_interessant",
        type: "singleChoice",
        label: "Die Geschichte der persönlichen Expertin / des Experten war interessant.",
        required: true,
        options: ["sehr interessant", "interessant", "eher langweilig", "gar nicht interessant"],
      },
      {
        id: "beteiligung_moeglich",
        type: "singleChoice",
        label: "Ich konnte meine eigenen Fragen stellen und mich beteiligen.",
        required: true,
        options: ["ja, voll und ganz", "eher ja", "eher nein", "gar nicht"],
      },
      {
        id: "offene_frage_positiv",
        type: "text",
        label: "Was war für dich besonders gut an diesem Tag?",
        required: false,
      },
      {
        id: "offene_frage_schwierig",
        type: "text",
        label: "Was war für dich schwierig oder nicht so gut?",
        required: false,
      },
      {
        id: "offene_frage_wunsch",
        type: "text",
        label: "Was wünschst du dir für das nächste Mal?",
        required: false,
      },
    ],
  },
  {
    id: "nudelname-test",
    title: "Test-Umfrage: Nudelname",
    description: "Kurze Test-Umfrage zur Prüfung von Speicherung und Auswertung.",
    questions: [
      {
        id: "nudelname_coolness",
        type: "rating",
        label: "Wie cool findest du Nudelnamen?",
        required: true,
        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        id: "lieblingsnudel",
        type: "singleChoice",
        label: "Welches ist deine Lieblingsnudelsorte?",
        required: true,
        options: ["Spaghetti", "Penne", "Fusilli", "Tagliatelle", "Rigatoni", "Farfalle"],
      },
      {
        id: "dein_nudelname",
        type: "text",
        label: "Wie ist dein Nudelname?",
        required: true,
      },
    ],
  },
  {
    id: "cannabis-parcours-evaluation",
    title: "Umfrage zum Workshop „Cannabis-Parcours“ (Februar 2026)",
    description:
      "Bitte erinnere dich an den Workshop und beantworte die Fragen ehrlich. Die Angaben sind anonym.",
    questions: [
      {
        id: "cannabis_geschlecht",
        type: "singleChoice",
        label: "Ich bin ...",
        required: true,
        options: ["männlich", "weiblich", "divers", "möchte ich nicht sagen"],
      },
      {
        id: "cannabis_alter_jahre",
        type: "text",
        label: "Ich bin ... Jahre alt",
        required: true,
        input: "short",
      },
      {
        id: "cannabis_gesamteindruck",
        type: "rating",
        label: "Wie war der Workshop insgesamt für dich?",
        required: true,
        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        id: "cannabis_sicherheit",
        type: "singleChoice",
        label: "Hast du dich sicher gefühlt? (z. B. um Fragen zu stellen oder deine Meinung zu sagen)",
        required: true,
        options: ["ja, sehr sicher", "eher sicher", "eher unsicher", "gar nicht sicher"],
      },
      {
        id: "cannabis_sprache",
        type: "singleChoice",
        label: "War die Sprache im Workshop einfach und gut zu verstehen?",
        required: true,
        options: ["ja, sehr gut", "meistens gut", "eher schwierig", "gar nicht zu verstehen"],
      },
      {
        id: "cannabis_lernen",
        type: "matrix",
        title: "Was hast du gelernt und wie siehst du das Thema in der Schule?",
        required: true,
        options: ["stimmt genau", "stimmt eher", "stimmt eher nicht", "stimmt gar nicht"],
        rows: [
          {
            id: "cannabis_risiken",
            label: "Ich kenne jetzt die Risiken von Cannabis besser als vorher.",
          },
          {
            id: "cannabis_auswirkungen",
            label: "Ich weiß jetzt besser, wie Cannabis mein Leben (Schule, Hobbys, Gesundheit) verändern kann.",
          },
          {
            id: "cannabis_arbeitsweise",
            label: "Die Art, wie wir im Workshop gearbeitet haben (Spiele, Aufgaben, Gespräche), war gut.",
          },
          {
            id: "cannabis_hilfe",
            label: "Ich weiß jetzt besser, wo ich Hilfe bekommen kann, wenn ich oder Freunde Probleme haben.",
          },
          {
            id: "cannabis_schule_drogen",
            label: "Ich finde es wichtig, dass wir in der Schule über Drogen sprechen.",
          },
          {
            id: "cannabis_freunde",
            label: "Ich würde Freunden raten, nicht mit Cannabis anzufangen.",
          },
        ],
      },
      {
        id: "cannabis_workshop_zukunft",
        type: "singleChoice",
        label: "Sollte die Schule diesen Workshop auch für die nächsten Klassen anbieten?",
        required: true,
        options: ["ja, auf jeden Fall", "eher ja", "eher nein", "nein, lieber etwas anderes suchen"],
      },
      {
        id: "cannabis_offen_bestes",
        type: "text",
        label: "Was war für dich am besten an diesem Workshop?",
        required: false,
      },
      {
        id: "cannabis_offen_schwierig",
        type: "text",
        label: "Was hat dir nicht gefallen oder was war schwierig?",
        required: false,
      },
      {
        id: "cannabis_offen_vorschlag",
        type: "text",
        label: "Hast du einen Vorschlag: Was können wir nächstes Mal besser machen?",
        required: false,
      },
    ],
  },
  {
    id: "gefangene-helfen-evaluation",
    title: "Umfrage zum Projekt „Gefangene helfen“ (Dezember 2025)",
    description:
      "Bitte beantworte die Fragen im Rückblick auf das Projekt ehrlich. Die Angaben sind anonym.",
    questions: [
      {
        id: "gefangene_geschlecht",
        type: "singleChoice",
        label: "Ich bin ...",
        required: true,
        options: ["männlich", "weiblich", "divers", "möchte ich nicht sagen"],
      },
      {
        id: "gefangene_alter_jahre",
        type: "text",
        label: "Ich bin ... Jahre alt",
        required: true,
        input: "short",
      },
      {
        id: "gefangene_gesamteindruck",
        type: "rating",
        label: "Wie bewertest du den Workshop mit Olly Jakobs im Rückblick?",
        required: true,
        scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        id: "gefangene_sicherheit",
        type: "singleChoice",
        label: "Hast du dich während des Projekts sicher gefühlt?",
        required: true,
        options: ["ja, sehr sicher", "eher sicher", "eher unsicher", "gar nicht sicher"],
      },
      {
        id: "gefangene_verstaendnis",
        type: "singleChoice",
        label: "War Olly Jakobs’ Geschichte gut zu verstehen?",
        required: true,
        options: ["ja, sehr gut", "meistens gut", "eher schwierig", "gar nicht zu verstehen"],
      },
      {
        id: "gefangene_lerneffekt",
        type: "matrix",
        title: "Inhalte und Lerneffekt",
        required: true,
        options: ["stimmt genau", "stimmt eher", "stimmt eher nicht", "stimmt gar nicht"],
        rows: [
          {
            id: "gefangene_leben_realitaet",
            label: "Ich weiß jetzt besser, wie das Leben im Gefängnis wirklich ist.",
          },
          {
            id: "gefangene_methoden_hilfreich",
            label: "Die Methoden (VR-Brille, Rollenspiele) waren hilfreich, um das Thema zu verstehen.",
          },
          {
            id: "gefangene_folgen_verstehen",
            label: "Ich verstehe die Folgen von Straftaten jetzt besser.",
          },
          {
            id: "gefangene_nachdenken",
            label: "Der Workshop hat mich zum Nachdenken über mein eigenes Leben gebracht.",
          },
          {
            id: "gefangene_taeter_in_schule",
            label: "Ich finde es gut, dass ein ehemaliger Täter in die Schule kommt, um über sein Leben zu sprechen.",
          },
        ],
      },
      {
        id: "gefangene_schule_behalten",
        type: "singleChoice",
        label: "Sollte unsere Schule dieses Projekt für zukünftige Klassen behalten?",
        required: true,
        options: ["ja, unbedingt", "eher ja", "eher nein", "nein, auf keinen Fall"],
      },
      {
        id: "gefangene_praevention_wirkung",
        type: "singleChoice",
        label: "Glaubst du, dass dieser Workshop Jugendlichen dabei hilft, keine Straftaten zu begehen?",
        required: true,
        options: ["ja, sicher", "eher ja", "eher nein", "gar nicht"],
      },
      {
        id: "gefangene_offen_gut",
        type: "text",
        label: "Was war für dich besonders gut?",
        required: false,
      },
      {
        id: "gefangene_offen_schwierig",
        type: "text",
        label: "Was war nicht so gut oder schwierig für dich?",
        required: false,
      },
      {
        id: "gefangene_offen_wunsch",
        type: "text",
        label: "Was wünschst du dir für die Gewalt-Prävention an unserer Schule?",
        required: false,
      },
    ],
  },
];
