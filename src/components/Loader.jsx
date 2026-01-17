const Loader = ({ size = "40px", color = "#3B82F6", message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
    <div
      className="animate-spin rounded-full border-4 border-t-transparent"
      style={{
        width: size,
        height: size,
        borderColor: `${color} ${color} transparent transparent`,
      }}
    />
    <p className="mt-2 text-gray-600 text-sm">{message}</p>
  </div>
);

export default Loader;
