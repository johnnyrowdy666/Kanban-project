export type Status = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";
export type Task = {
  title: string;
  id: string;
  status: Status;
  priority: Priority;
  points?: number;
};

export const statuses: Status[] = ["todo", "in-progress", "done"];
export const priorities: Priority[] = ["low", "medium", "high"];

export const tasks: Task[] = [
  {
    title: "Conduct Market Research",
    id: "BUS-1",
    status: "todo",
    points: 5,
    priority: "high",
  },
  {
    title: "Perform Competitor Analysis",
    id: "BUS-2",
    status: "in-progress",
    points: 6,
    priority: "medium",
  },
  {
    title: "Develop Business Strategy",
    id: "BUS-3",
    status: "done",
    points: 8,
    priority: "high",
  },
  {
    title: "Customer Feedback Survey",
    id: "BUS-4",
    status: "todo",
    points: 4,
    priority: "medium",
  },
  {
    title: "Create Marketing Plan",
    id: "BUS-5",
    status: "in-progress",
    points: 7,
    priority: "high",
  },
  {
    title: "Financial Projection Report",
    id: "BUS-6",
    status: "done",
    points: 9,
    priority: "high",
  },
  {
    title: "Design Product Prototype",
    id: "BUS-7",
    status: "todo",
    points: 6,
    priority: "medium",
  },
  {
    title: "Plan Social Media Campaign",
    id: "BUS-8",
    status: "in-progress",
    points: 5,
    priority: "low",
  },
  {
    title: "Pitch Deck Preparation",
    id: "BUS-9",
    status: "done",
    points: 8,
    priority: "medium",
  },
  {
    title: "Identify Potential Investors",
    id: "BUS-10",
    status: "todo",
    points: 7,
    priority: "high",
  },
  {
    title: "Build Networking Connections",
    id: "BUS-11",
    status: "in-progress",
    points: 4,
    priority: "low",
  },
  {
    title: "Evaluate Partnership Opportunities",
    id: "BUS-12",
    status: "done",
    points: 6,
    priority: "medium",
  },
];
