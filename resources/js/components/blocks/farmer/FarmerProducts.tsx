import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 假商品型別（待 /types/product.ts 正式定義）
type ProductLite = {
  id: string;
  name: string;
  image: string;
  price: number;
  original_price?: number;
  spec?: string;
};

type Props = { products: ProductLite[] };

/**
 * 導購區（農友頁下半部，承襲現況一頁式導購邏輯）
 * 手機版底部自動有 sticky CTA bar
 */
export function FarmerProducts({ products }: Props) {
  if (!products.length) return null;
  const headline = products[0];

  return (
    <section id="farmer-products" className="bg-paper-card border-t-2 border-vermillion/20">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <header className="text-center mb-12">
          <div className="stamp-seal inline-flex mb-4">買</div>
          <h2 className="font-serif text-3xl lg:text-4xl text-ink">買他種的</h2>
          <p className="text-ink-mid mt-2">故事看到這裡，也讓味道到你家。</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p.id}>
              <div className="aspect-square bg-paper-warm overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <CardBody>
                <h3 className="font-serif text-lg text-ink mb-1">{p.name}</h3>
                {p.spec && <p className="text-sm text-ink-light mb-3">{p.spec}</p>}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-latin text-2xl text-vermillion">
                    NT$ {p.price.toLocaleString()}
                  </span>
                  {p.original_price && (
                    <span className="font-latin text-sm text-ink-light line-through">
                      NT$ {p.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                <Button variant="cta" className="w-full">
                  加入購物車
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* 手機 sticky CTA bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-rule-dark px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-light truncate">{headline.name}</p>
          <p className="font-latin text-lg text-vermillion">
            NT$ {headline.price.toLocaleString()}
          </p>
        </div>
        <Button variant="cta" size="md">
          加入購物車
        </Button>
      </div>
    </section>
  );
}
