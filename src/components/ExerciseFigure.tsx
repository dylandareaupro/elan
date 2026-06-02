/* ============================================================
   EXERCISE FIGURE — editorial line-art silhouette (ported from core.jsx)
   ============================================================ */
import React from "react";

export function ExerciseFigure({ id, color = "#131312" }: { id: string; color?: string }) {
  const F = color;
  const TORSO = 21, LIMB = 13, FORE = 11;
  const Limb = ({ x1, y1, x2, y2, w = LIMB }: { x1: number; y1: number; x2: number; y2: number; w?: number }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={F} strokeWidth={w} strokeLinecap="round" />
  );
  const Joint = ({ cx, cy, r = 6.5, className }: { cx: number; cy: number; r?: number; className?: string }) => <circle cx={cx} cy={cy} r={r} fill={F} className={className} />;
  const Hand = ({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) => <circle cx={cx} cy={cy} r={r} fill={F} />;
  const Foot = ({ cx, cy, rotate = 0 }: { cx: number; cy: number; rotate?: number }) => (
    <path d={`M ${cx - 9} ${cy} q -2 6 5 6 l 11 0 q 6 0 5 -5 q -1 -5 -8 -5 z`} fill={F} transform={`rotate(${rotate} ${cx} ${cy})`} />
  );
  const Head = ({ cx, cy, r = 13.5, pony = [-1, -0.4] }: { cx: number; cy: number; r?: number; pony?: number[] }) => (
    <g>
      <circle cx={cx + pony[0] * r * 0.85} cy={cy + pony[1] * r * 0.85} r={r * 0.42} fill={F} />
      <circle cx={cx} cy={cy} r={r} fill={F} />
    </g>
  );
  const Shadow = ({ cx = 120, cy = 178, rx = 86, ry = 9 }: { cx?: number; cy?: number; rx?: number; ry?: number }) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={F} opacity="0.09" />
  );
  return (
    <svg viewBox="0 0 240 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <style>{`
          @keyframes vp-tension { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-0.7px)} 75%{transform:translateY(0.7px)} }
          @keyframes vp-hold { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
          @keyframes vp-crunch { 0%,100%{transform:rotate(0)} 40%,60%{transform:rotate(-26deg)} }
          @keyframes vp-leg { 0%,100%{transform:rotate(0)} 45%,55%{transform:rotate(-80deg)} }
          @keyframes vp-twist { 0%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} 100%{transform:rotate(-20deg)} }
          @keyframes vp-mca { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-48px,-16px)} }
          @keyframes vp-mcb { 0%,50%,100%{transform:translate(0,0)} 25%,75%{transform:translate(-48px,-16px)} }
          @keyframes vp-squat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(13px)} }
          @keyframes vp-jj { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.18)} }
          @keyframes vp-lift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes vp-pushup { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
          .vp-fig .tension{animation:vp-tension .5s ease-in-out infinite}
          .vp-fig .hold{animation:vp-hold 2.6s ease-in-out infinite;transform-origin:center}
          .vp-fig .crunch{animation:vp-crunch 1.6s cubic-bezier(.4,0,.6,1) infinite}
          .vp-fig .leg{animation:vp-leg 2s cubic-bezier(.4,0,.6,1) infinite}
          .vp-fig .twist{animation:vp-twist 1.1s ease-in-out infinite}
          .vp-fig .mca{animation:vp-mca 1s ease-in-out infinite}
          .vp-fig .mcb{animation:vp-mcb 1s ease-in-out infinite}
          .vp-fig .squat{animation:vp-squat 2s cubic-bezier(.4,0,.6,1) infinite;transform-origin:center}
          .vp-fig .jj{animation:vp-jj 1s ease-in-out infinite;transform-origin:120px 120px}
          .vp-fig .lift{animation:vp-lift 2.4s ease-in-out infinite;transform-origin:center}
          .vp-fig .pushup{animation:vp-pushup 1.8s cubic-bezier(.4,0,.6,1) infinite;transform-origin:center}
        `}</style>
      </defs>
      <g className="vp-fig">
        <Shadow />
        {id === "plank" && (
          <g className="tension">
            <Limb x1={172} y1={138} x2={208} y2={168} /><Foot cx={210} cy={170} rotate={26} />
            <Limb x1={74} y1={120} x2={172} y2={138} w={TORSO} />
            <Joint cx={74} cy={120} r={8} /><Limb x1={74} y1={120} x2={60} y2={150} /><Hand cx={59} cy={166} /><Limb x1={60} y1={150} x2={59} y2={166} w={FORE} />
            <Head cx={60} cy={106} pony={[1, -0.3]} />
          </g>
        )}
        {id === "crunch" && (
          <>
            <Foot cx={214} cy={168} rotate={20} /><Limb x1={212} y1={166} x2={186} y2={126} /><Joint cx={186} cy={126} r={7} /><Limb x1={186} y1={126} x2={150} y2={154} />
            <g style={{ transformOrigin: "150px 154px" }} className="crunch">
              <Limb x1={150} y1={154} x2={82} y2={158} w={TORSO} />
              <Limb x1={84} y1={156} x2={64} y2={142} /><Hand cx={62} cy={140} />
              <Head cx={70} cy={150} pony={[1, 0.2]} />
            </g>
          </>
        )}
        {id === "mountain" && (
          <>
            <Limb x1={72} y1={116} x2={64} y2={166} /><Hand cx={63} cy={168} />
            <Limb x1={72} y1={116} x2={170} y2={138} w={TORSO} /><Joint cx={170} cy={138} r={8} /><Head cx={58} cy={104} pony={[1, -0.3]} />
            <g className="mca"><Limb x1={170} y1={138} x2={212} y2={166} /><Foot cx={214} cy={168} rotate={24} /></g>
            <g className="mcb"><Limb x1={170} y1={138} x2={150} y2={150} /><Limb x1={150} y1={150} x2={150} y2={172} /><Foot cx={150} cy={174} rotate={4} /></g>
          </>
        )}
        {(id === "sideR" || id === "sideL") && (
          <g className="hold" transform={id === "sideL" ? "translate(240 0) scale(-1 1)" : ""}>
            <Limb x1={60} y1={168} x2={102} y2={168} /><Foot cx={104} cy={168} rotate={0} />
            <Limb x1={64} y1={168} x2={82} y2={112} /><Joint cx={82} cy={112} r={7} />
            <Limb x1={82} y1={112} x2={210} y2={158} w={TORSO} /><Foot cx={213} cy={160} rotate={-18} />
            <Limb x1={82} y1={112} x2={122} y2={58} /><Hand cx={124} cy={54} />
            <Head cx={74} cy={96} pony={[-0.6, -0.7]} />
          </g>
        )}
        {id === "legraise" && (
          <>
            <Limb x1={60} y1={148} x2={140} y2={150} w={TORSO} />
            <Limb x1={80} y1={150} x2={80} y2={166} w={FORE} /><Foot cx={80} cy={168} rotate={4} />
            <Limb x1={102} y1={150} x2={102} y2={166} w={FORE} /><Foot cx={102} cy={168} rotate={4} />
            <Head cx={46} cy={146} pony={[0.4, -0.9]} />
            <g style={{ transformOrigin: "140px 150px" }} className="leg">
              <Joint cx={140} cy={150} r={8} /><Limb x1={140} y1={150} x2={212} y2={150} /><Foot cx={214} cy={150} rotate={-86} />
            </g>
          </>
        )}
        {id === "twist" && (
          <>
            <Limb x1={120} y1={160} x2={172} y2={132} /><Joint cx={172} cy={132} r={7} /><Limb x1={172} y1={132} x2={208} y2={156} /><Foot cx={210} cy={158} rotate={20} />
            <g style={{ transformOrigin: "120px 160px" }} className="twist">
              <Limb x1={120} y1={160} x2={120} y2={106} w={TORSO} />
              <Limb x1={120} y1={120} x2={156} y2={140} /><Limb x1={120} y1={124} x2={156} y2={140} /><Hand cx={158} cy={141} r={9} />
              <Head cx={120} cy={90} pony={[-0.9, -0.3]} />
            </g>
          </>
        )}
        {id === "cobra" && (
          <g className="lift">
            <Limb x1={210} y1={166} x2={120} y2={158} w={TORSO} /><Foot cx={212} cy={166} rotate={8} />
            <Limb x1={120} y1={158} x2={96} y2={118} /><Joint cx={96} cy={118} r={7} />
            <Limb x1={96} y1={118} x2={88} y2={166} /><Hand cx={87} cy={168} />
            <Head cx={88} cy={104} pony={[1, 0.1]} />
          </g>
        )}
        {id === "superman" && (
          <g className="lift">
            <Limb x1={70} y1={150} x2={172} y2={150} w={TORSO} />
            <Limb x1={172} y1={150} x2={214} y2={132} /><Foot cx={216} cy={131} rotate={-30} />
            <Limb x1={172} y1={150} x2={206} y2={150} /><Foot cx={208} cy={150} rotate={-12} />
            <Limb x1={70} y1={150} x2={34} y2={132} /><Hand cx={32} cy={131} />
            <Limb x1={70} y1={150} x2={42} y2={150} /><Hand cx={40} cy={150} />
            <Head cx={64} cy={138} pony={[0.6, -0.8]} />
          </g>
        )}
        {id === "squat" && (
          <g className="squat">
            <Head cx={120} cy={58} pony={[-1, -0.3]} />
            <Limb x1={120} y1={74} x2={120} y2={120} w={TORSO} />
            <Limb x1={120} y1={86} x2={150} y2={110} /><Hand cx={152} cy={111} />
            <Limb x1={120} y1={86} x2={92} y2={108} /><Hand cx={90} cy={109} />
            <Limb x1={120} y1={120} x2={142} y2={146} /><Limb x1={142} y1={146} x2={132} y2={170} /><Foot cx={132} cy={172} rotate={6} />
            <Limb x1={120} y1={120} x2={98} y2={146} /><Limb x1={98} y1={146} x2={108} y2={170} /><Foot cx={108} cy={172} rotate={-6} />
            <Joint cx={142} cy={146} r={6.5} /><Joint cx={98} cy={146} r={6.5} />
          </g>
        )}
        {id === "bridge" && (
          <>
            <Limb x1={70} y1={150} x2={132} y2={128} w={TORSO} />
            <Limb x1={132} y1={128} x2={150} y2={150} /><Limb x1={150} y1={150} x2={150} y2={168} /><Foot cx={152} cy={170} rotate={8} />
            <Limb x1={70} y1={150} x2={56} y2={168} /><Hand cx={55} cy={170} />
            <Joint cx={132} cy={128} r={7} className="lift" />
            <Head cx={56} cy={146} pony={[0.5, -0.8]} />
          </>
        )}
        {id === "pushup" && (
          <g className="pushup">
            <Limb x1={172} y1={140} x2={210} y2={166} /><Foot cx={212} cy={168} rotate={26} />
            <Limb x1={78} y1={132} x2={172} y2={140} w={TORSO} />
            <Limb x1={86} y1={134} x2={86} y2={166} /><Hand cx={86} cy={168} />
            <Head cx={64} cy={124} pony={[1, -0.2]} />
          </g>
        )}
        {id === "jumpingjack" && (
          <g className="jj">
            <Head cx={120} cy={54} pony={[-0.3, -0.95]} />
            <Limb x1={120} y1={70} x2={120} y2={120} w={TORSO} />
            <Limb x1={120} y1={80} x2={86} y2={56} /><Hand cx={84} cy={54} />
            <Limb x1={120} y1={80} x2={154} y2={56} /><Hand cx={156} cy={54} />
            <Limb x1={120} y1={120} x2={96} y2={166} /><Foot cx={94} cy={168} rotate={-14} />
            <Limb x1={120} y1={120} x2={144} y2={166} /><Foot cx={146} cy={168} rotate={14} />
          </g>
        )}
        {id === "lunge" && (
          <g className="squat">
            <Head cx={108} cy={58} pony={[-1, -0.3]} />
            <Limb x1={108} y1={74} x2={112} y2={120} w={TORSO} />
            <Limb x1={110} y1={92} x2={138} y2={108} /><Hand cx={140} cy={109} />
            <Limb x1={112} y1={120} x2={158} y2={134} /><Limb x1={158} y1={134} x2={158} y2={168} /><Foot cx={160} cy={170} rotate={8} />
            <Limb x1={112} y1={120} x2={86} y2={150} /><Limb x1={86} y1={150} x2={96} y2={170} /><Foot cx={98} cy={172} rotate={-4} />
            <Joint cx={158} cy={134} r={6.5} />
          </g>
        )}
        {!["plank", "crunch", "mountain", "sideR", "sideL", "legraise", "twist", "cobra", "superman", "squat", "bridge", "pushup", "jumpingjack", "lunge"].includes(id) && (
          <g className="hold">
            <Head cx={120} cy={50} pony={[-1, -0.3]} />
            <Limb x1={120} y1={66} x2={120} y2={124} w={TORSO} />
            <Limb x1={120} y1={82} x2={90} y2={114} /><Hand cx={88} cy={116} />
            <Limb x1={120} y1={82} x2={150} y2={114} /><Hand cx={152} cy={116} />
            <Limb x1={120} y1={124} x2={102} y2={166} /><Foot cx={100} cy={168} rotate={-10} />
            <Limb x1={120} y1={124} x2={138} y2={166} /><Foot cx={140} cy={168} rotate={10} />
          </g>
        )}
      </g>
    </svg>
  );
}
