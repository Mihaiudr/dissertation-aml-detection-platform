function StatCard ({ title, value, subtitle, icon}) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>

            <div>
                <p>{title}</p>
                <h2>{value}</h2>
                {subtitle && <span>{subtitle}</span>}
            </div>
        </div>
    );
}

export default StatCard;
