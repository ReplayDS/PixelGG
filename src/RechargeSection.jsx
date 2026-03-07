import { useMemo, useRef, useState } from "react";
import { useSiteData } from "./SiteDataContext";
import "./recharge-section.css";

function formatBRL(value) {
  const numeric = Number(value || 0);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

export default function RechargeSection() {
  const { rechargeGames, rechargeOptions } = useSiteData();
  const games = [...rechargeGames].filter(game => game.active).sort((a, b) => a.order - b.order);
  const [activeGameId, setActiveGameId] = useState(games[0]?.id);
  const [stepIndex, setStepIndex] = useState(0);
  const [dragRatio, setDragRatio] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const options = useMemo(() => {
    return rechargeOptions
      .filter(option => option.active && option.gameId === activeGameId)
      .sort((a, b) => a.order - b.order);
  }, [rechargeOptions, activeGameId]);

  const maxIndex = Math.max(0, options.length - 1);
  const safeIndex = Math.min(stepIndex, maxIndex);
  const selectedOption = options[safeIndex];
  const activeRatio = maxIndex === 0 ? 0 : (dragRatio ?? safeIndex / maxIndex);
  const curveStartY = 28;
  const curveControlY = 4;
  const thumbY =
    (1 - activeRatio) * (1 - activeRatio) * curveStartY
    + 2 * (1 - activeRatio) * activeRatio * curveControlY
    + activeRatio * activeRatio * curveStartY;

  function ratioFromClientX(clientX) {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, ratio));
  }

  function handleSliderPointerDown(event) {
    if (options.length <= 1) return;
    event.preventDefault();

    const onMove = (moveEvent) => {
      setDragRatio(ratioFromClientX(moveEvent.clientX));
    };

    const onUp = (upEvent) => {
      const ratio = ratioFromClientX(upEvent.clientX);
      setStepIndex(Math.round(ratio * maxIndex));
      setDragRatio(null);
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    setIsDragging(true);
    setDragRatio(ratioFromClientX(event.clientX));
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <section className="recharge-wrap">
      <div className="recharge-head">
        <h2>Recargas</h2>
      </div>

      <div className="recharge-games">
        {games.map(game => (
          <button
            key={game.id}
            className={`recharge-game${game.id === activeGameId ? " active" : ""}`}
            onClick={() => {
              setActiveGameId(game.id);
              setStepIndex(0);
            }}
          >
            <img src={game.image} alt={game.title} />
            <span>{game.title}</span>
          </button>
        ))}
      </div>

      {selectedOption ? (
        <div className="recharge-card recharge-card-flat">
          <div className="recharge-values">
            <div>
              <small>Quantidade</small>
              <strong>{selectedOption.gems} gemas</strong>
            </div>
            <div>
              <small>Valor</small>
              <strong>{formatBRL(selectedOption.value)}</strong>
            </div>
          </div>

          <div
            className={`recharge-slider${isDragging ? " is-dragging" : ""}`}
            ref={sliderRef}
            onPointerDown={handleSliderPointerDown}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={maxIndex}
            aria-valuenow={safeIndex}
            tabIndex={0}
          >
            <svg className="recharge-slider-track" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
              <path d="M8 28 Q500 4 992 28" />
            </svg>
            <button
              type="button"
              className="recharge-slider-thumb"
              style={{ left: `${activeRatio * 100}%`, top: `${thumbY - 13}px` }}
              onPointerDown={handleSliderPointerDown}
              aria-label="Selecionar valor de recarga"
            />
          </div>

          <button className="recharge-buy">Comprar</button>
        </div>
      ) : (
        <div className="recharge-empty">Nenhuma recarga ativa para este jogo.</div>
      )}
    </section>
  );
}
