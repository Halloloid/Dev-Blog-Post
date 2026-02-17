import {Eye,Heart,MessageCircle} from "lucide-react"

interface CardProps{
    title:string;
    featured_img:string;
    view_count:number;
    likes_count:number;
    comments_count:number;
    exceprt?:string;
}

const Card = ({title,featured_img,view_count,likes_count,comments_count,exceprt}:CardProps) => {
  return (
    <div className="group relative flex w-full h-60 overflow-hidden rounded-xl border border-vio/30 bg-gray-950 mb-8">
      
      {/* Image Section */}
      <div className="relative w-80 shrink-0 overflow-hidden">
        <img
          src={featured_img}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Magenta overlay on hover */}
        <div className="absolute inset-0 bg-vio/0 transition-colors duration-500 group-hover:bg-vio/10" />
        {/* Right fade into card */}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-7 relative z-10">
        <div>
          <h3 className="mb-3 text-2xl font-bold text-white leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-vio">
            {title}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
            {exceprt || "View More"}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 pt-3">
          <StatBadge icon={<Eye className="h-4 w-4" />} count={view_count} label="Views" />
          <StatBadge icon={<Heart className="h-4 w-4" />} count={likes_count} label="Likes" />
          <StatBadge icon={<MessageCircle className="h-4 w-4" />} count={comments_count} label="Comments" />
        </div>
      </div>

      {/* Bottom magenta glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-vio/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}

const StatBadge = ({ icon, count, label }: { icon: React.ReactNode; count: number; label: string }) => (
  <div className="flex items-center gap-2 rounded-full bg-vio/10 px-3 py-1.5 text-vio transition-all duration-300 hover:bg-vio/20">
    {icon}
    <span className="text-sm font-semibold">{formatCount(count)}</span>
    <span className="text-xs text-vio/60 hidden sm:inline">{label}</span>
  </div>
);

const formatCount = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
};

export default Card