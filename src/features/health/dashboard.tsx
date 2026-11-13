import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  Stethoscope,
  BookOpen,
  Heart,
  HeartPulse,
  Brain,
  Wind,
  Activity,
  Droplets,
  Bone,
  ShieldCheck,
  Leaf,
  TriangleAlert,
  Clock,
  Plus,
  Send,
  Smile,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "./shell";
import { useSession } from "./session";
import nutrition from "@/assets/nutrition.jpg";
const categoryItems = [
  ["Heart health", Heart],
  ["Diabetes & hormones", Droplets],
  ["Skin & allergies", Sun],
  ["Respiratory health", Wind],
  ["Brain & nerves", Brain],
  ["Digestive health", Activity],
  ["Bones & joints", Bone],
  ["Mental wellbeing", Smile],
] as const;
export function Dashboard() {
  const { user } = useSession();
  const name = user?.user_metadata?.["display_name"];
  return (
    <Shell>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] text-muted-foreground mb-2">YOUR PERSONAL HEALTH COMPANION</p>
          <h1 className="page-heading">
            {name ? `Welcome back, ${name}` : "A healthier you starts here"}{" "}
            <span className="text-primary">✦</span>
          </h1>
          <p className="page-subtitle">Let’s take a small step toward understanding your health.</p>
        </div>
        <span className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground mt-6">
          <Sun size={16} />
          One day at a time
        </span>
      </div>
      <div className="dashboard-grid">
        <div>
          <section className="welcome-band">
            <div>
              <span className="text-primary text-[10px] font-semibold flex gap-1.5 items-center">
                <ShieldCheck size={13} />
                HERE FOR YOU, EVERY STEP
              </span>
              <h2>
                Your health questions.
                <br />A little more clarity.
              </h2>
              <p>
                Talk about what’s on your mind and find understandable guidance for your next step.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/conversations">
                  Talk to your health assistant
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="health-emblem">
              <HeartPulse />
            </div>
          </section>
          <div className="section-title">
            <h2>How can we help you today?</h2>
          </div>
          <div className="action-grid">
            {[
              {
                title: "Chat with your assistant",
                text: "A safe space for your health questions.",
                to: "/conversations" as const,
                icon: MessageCircle,
                tone: "",
              },
              {
                title: "Check your symptoms",
                text: "Understand symptoms, one step at a time.",
                to: "/symptom-checker" as const,
                icon: Stethoscope,
                tone: "green",
              },
              {
                title: "Explore health conditions",
                text: "Reliable information, in simple words.",
                to: "/conditions" as const,
                icon: BookOpen,
                tone: "warm",
              },
            ].map((a) => (
              <Link key={a.title} to={a.to} className="action-card">
                <span className={`icon-tile ${a.tone}`}>
                  <a.icon size={19} />
                </span>
                <strong>{a.title}</strong>
                <p>{a.text}</p>
              </Link>
            ))}
          </div>
          <div className="section-title">
            <h2>Explore by health category</h2>
            <Button asChild variant="link" size="sm">
              <Link to="/conditions">
                View all
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="category-grid">
            {categoryItems.map(([title, Icon]) => (
              <Link
                to="/conditions"
                search={{ category: title }}
                key={title}
                className="category-card"
              >
                <Icon />
                <span>{title}</span>
              </Link>
            ))}
          </div>
          <div className="section-title">
            <h2>A conversation can be a good start</h2>
            <span className="text-[10px] text-success flex gap-1.5 items-center">
              <span className="size-1.5 rounded-full bg-success" />
              Ready when you are
            </span>
          </div>
          <section className="chat-preview">
            <div className="chat-preview-head">
              <span className="icon-tile">
                <HeartPulse size={21} />
              </span>
              <div>
                <h3 className="text-[13px] font-semibold">Carewise health assistant</h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Thoughtful guidance. Without the guesswork.
                </p>
              </div>
              <ShieldCheck className="ml-auto text-success" size={17} />
            </div>
            <div className="chat-preview-body">
              <span className="text-primary">
                <HeartPulse size={19} />
              </span>
              <div>
                <p>Hi there! I’m here to help you make sense of your health concerns.</p>
                <p className="mt-1">How are you feeling today?</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["I have a headache", "I’m feeling tired", "I have a health question"].map(
                    (t) => (
                      <Button asChild key={t} variant="outline" size="sm" className="text-[10px]">
                        <Link to="/conversations">{t}</Link>
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="chat-preview-input">
              <Button
                asChild
                variant="outline"
                className="w-full justify-between text-muted-foreground font-normal h-11"
              >
                <Link to="/conversations">
                  Share what’s on your mind...
                  <Send className="text-primary" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
        <aside className="dashboard-right">
          <div>
            <section className="wellness-block">
              <h2 className="right-heading">
                <Leaf className="text-success" size={18} />A little wellness, daily
              </h2>
              <h3>Make room for a mindful moment.</h3>
              <p>
                Pause. Take a few slow breaths. Small moments of calm can make a difference to your
                day.
              </p>
              <span className="text-success text-[10px] flex items-center gap-1.5">
                <Heart size={12} />
                Small steps, lasting wellbeing
              </span>
            </section>
            <div className="section-title">
              <h2>Good to know</h2>
              <Button asChild variant="link" size="sm">
                <Link to="/articles">
                  All articles
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <Link to="/articles" className="article-card block">
              <img
                src={nutrition}
                alt="Fresh avocado, berries, citrus and leafy greens"
                width={1024}
                height={768}
                loading="lazy"
              />
              <div className="p-4">
                <span className="text-success text-[9px] uppercase font-semibold">
                  NUTRITION & WELLBEING
                </span>
                <h3>
                  Everyday foods for a<br />
                  healthier, happier you
                </h3>
                <p className="flex gap-1.5 items-center">
                  <Clock size={12} />4 min read
                  <span className="ml-auto text-primary">Read article →</span>
                </p>
              </div>
            </Link>
          </div>
          <section className="emergency-block">
            <h2 className="right-heading text-warning">
              <TriangleAlert size={17} />
              Need urgent help?
            </h2>
            <p>
              Chest pain, difficulty breathing, or sudden weakness? Don’t wait for an online
              response.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-warning border-warning/20"
            >
              <a href="tel:112">
                <Plus />
                Contact emergency services
              </a>
            </Button>
            <p className="mb-0 text-[10px]">112 in India · Use your local emergency number.</p>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
