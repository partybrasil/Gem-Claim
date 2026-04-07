import { motion } from 'framer-motion';

const variants = {
  primary:
    'border-cyan-400/50 bg-cyan-500/10 text-cyan-100 shadow-reactor hover:bg-cyan-400/15 hover:text-white',
  secondary:
    'border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100 shadow-violet hover:bg-fuchsia-400/15 hover:text-white',
  ghost:
    'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white'
};

export function NeonButton({
  children,
  icon: Icon,
  variant = 'primary',
  active = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] transition duration-300',
        variants[variant],
        active ? 'border-cyan-300/70 bg-cyan-400/15 text-white shadow-reactor' : '',
        className
      ].join(' ')}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </motion.button>
  );
}