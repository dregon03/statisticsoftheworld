import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-posts';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog — Global Economy Insights & Data Analysis',
  description: 'Data-driven articles on the global economy. GDP rankings, inflation trends, population statistics, and more — backed by IMF and World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/blog' },
};

export default function BlogIndex() {
  const categories = [...new Set(BLOG_POSTS.map(p => p.category))];

  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[900px] mx-auto px-6 py-10">
        <h1 className="text-[32px] font-extrabold mb-2 text-[#0d1b2a]">Blog</h1>
        <p className="text-[15px] text-[#64748b] mb-8">Data-driven articles on the global economy, updated with the latest IMF and World Bank data.</p>

        {categories.map(cat => {
          const posts = BLOG_POSTS.filter(p => p.category === cat);
          return (
            <div key={cat} className="mb-10">
              <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">{cat}</h2>
              <div className="space-y-4">
                {posts.map(post => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block border border-[#d5dce6] rounded-xl p-5 hover:border-[#b0bdd0] hover:bg-[#fafbfd] transition group"
                  >
                    <h3 className="text-[16px] font-semibold text-[#0d1b2a] group-hover:text-[#0066cc] transition mb-1">
                      {post.title}
                    </h3>
                    <p className="text-[14px] text-[#64748b] leading-relaxed">
                      {post.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
      <Footer />
    </main>
  );
}
