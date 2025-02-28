const Section = ({ id, children, className = "" }) => {
  return (
    <section
      id={id}
      className={`
        min-h-screen
        w-full
        py-20
        px-4
        md:px-8
        relative
        overflow-hidden
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {children}
      </div>
    </section>
  );
};

export default Section; 