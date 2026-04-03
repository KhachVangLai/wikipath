import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";
import { getHopLabel } from "../utils/formatters";

interface PathVisualizerProps {
  from: string;
  to: string;
  path: string[];
  depth: number;
  muted?: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06
    }
  }
};

const nodeVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      ease: "easeOut"
    }
  }
};

const connectorVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0, scaleY: 0.2 },
  visible: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    transition: {
      duration: 0.28,
      ease: "easeOut"
    }
  }
};

export function PathVisualizer({
  from,
  to,
  path,
  depth,
  muted = false
}: PathVisualizerProps) {
  return (
    <div
      className={
        muted ? "path-visualizer path-visualizer--muted" : "path-visualizer"
      }
    >
      <div className="path-visualizer__header">
        <div>
          <span className="eyebrow">Shortest path</span>
          <h3>
            {from} to {to}
          </h3>
        </div>
        <span className="path-visualizer__badge">{getHopLabel(depth)}</span>
      </div>

      <motion.div
        className="path-visualizer__rail"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {path.map((node, index) => {
          const isFirst = index === 0;
          const isLast = index === path.length - 1;

          return (
            <Fragment key={`${node}-${index}`}>
              <motion.article className="path-node" variants={nodeVariants}>
                <span className="path-node__step">
                  {isFirst ? "Start" : isLast ? "Destination" : `Hop ${index}`}
                </span>
                <strong>{node}</strong>
              </motion.article>

              {!isLast ? (
                <motion.div
                  aria-hidden="true"
                  className="path-connector"
                  variants={connectorVariants}
                >
                  <span className="path-connector__line" />
                  <span className="path-connector__arrow">→</span>
                </motion.div>
              ) : null}
            </Fragment>
          );
        })}
      </motion.div>
    </div>
  );
}
