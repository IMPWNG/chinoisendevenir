// src/components/VacationAlert.jsx
const VacationAlert = ({ t }) => {
  return (
    <div className="vacation-alert">
      <div className="container vacation-alert-content">
        <span className="vacation-alert-icon">🏖️</span>
        <p className="vacation-alert-text">
          {t.vacation_alert_text ||
            "Nous sommes actuellement en période de vacances scolaires : les universités sont fermées. Les délais de réponse peuvent donc être plus longs que d'habitude. Merci de votre patience !"}
        </p>
      </div>
    </div>
  );
};

export default VacationAlert;
