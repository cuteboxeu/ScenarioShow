import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    ru: {
        translation: {
            app: {
                title: "Scenario Show",
                settings: "Настройки",
                ready: "Готов к запуску",
                setupHint: "Нужно минимум 2 участника и 1 раунд",
                startShow: "Начать шоу",
            },
            mode: {
                title: "Режим",
                subtitle: "Рандом или кастом",
                label: "Режим:",
                custom: "Кастом",
                random: "Радном",
            },
            participants: {
                title: "Участники",
                minHint: "Минимум 2 участника",
                namePlaceholder: "Имя участника",
                remove: "Осименить",
                avatarPlaceholder: "URL аватара",
                addPlaceholder: "Добавить участника",
                addButton: "Добавить",
                unnamed: "Безымянный",
                defaultName: "Участник",
                avatarAlt: "{{name}} аватар",
            },
            rounds: {
                title: "Раунды",
                label: "Количество раундов (5 макс.)",
            },
            scores: {
                title: "Планируемые очки",
                subtitle: "Только в кастом режиме",
                participant: "Участник",
                round: "Раунд {{number}}",
                empty: "Нет участников или раундов",
            },
        },
    },
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources,
        lng: "ru",
        fallbackLng: "ru",
        supportedLngs: ["ru"],
        interpolation: {
            escapeValue: false,
        },
    });
}

export default i18n;
