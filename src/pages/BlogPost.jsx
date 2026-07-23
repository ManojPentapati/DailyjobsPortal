import { useParams, Link, useNavigate } from "react";
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, BookOpen } from "lucide-react";
import { blogPosts } from "../data/blogPosts";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const post = blogPosts.find((p) => p.slug === slug || p.id === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 max-w-md">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Article Not Found</h2>
          <p className="text-stone-600 dark:text-slate-400 text-sm mb-6">The career article you are looking for does not exist or has been moved.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Career Articles
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 2);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Schema.org Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": post.image,
            "author": {
              "@type": "Person",
              "name": post.author,
              "jobTitle": post.authorRole
            },
            "publisher": {
              "@type": "Organization",
              "name": "Daily Jobs Portal",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dailyjobs-portal.vercel.app/favicon.svg"
              }
            },
            "datePublished": post.date,
            "description": post.excerpt
          })
        }}
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-stone-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-semibold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        {/* Header Content */}
        <header className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            {post.category}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-stone-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-6 font-medium">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-stone-200 dark:border-stone-800 text-sm text-stone-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-white leading-none">{post.author}</p>
                <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">{post.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-400" />
                {post.readTime}
              </span>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white transition-colors"
                title="Share Article"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-10 border border-stone-200 dark:border-stone-800 shadow-md">
          <img src={post.image} alt={post.title} className="w-full h-80 sm:h-96 object-cover" />
        </div>

        {/* Article Body */}
        <main className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-sm mb-12">
          <div
            className="prose prose-stone dark:prose-invert max-w-none 
              prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-extrabold prose-h2:text-stone-900 dark:prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-lg prose-h3:font-bold prose-h3:text-stone-900 dark:prose-h3:text-white prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-stone-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
              prose-li:text-stone-700 dark:prose-li:text-slate-300 prose-li:mb-2
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-slate-300 text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </main>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>Recommended Guides</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-500 uppercase">{rel.category}</span>
                    <h4 className="text-lg font-bold text-stone-900 dark:text-white mt-1 mb-2 line-clamp-2">
                      <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2">{rel.excerpt}</p>
                  </div>
                  <Link
                    to={`/blog/${rel.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 mt-4"
                  >
                    Read Article →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
