import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/web/src/components/ui/tabs';

type TabsInfoProps = {
  tabs: {
    value: string;
    label: string;
    content: React.ReactNode;
    defaultTab?: boolean;
  }[];
};
export const TabsInfo = ({ tabs }: TabsInfoProps) => (
  <Tabs
    className="w-full overflow-hidden rounded-2xl border bg-white shadow"
    defaultValue={tabs.find((tab) => tab.defaultTab)?.value || tabs[0]?.value}
  >
    <TabsList className="flex w-full justify-start gap-2 rounded-none border-b bg-white px-4 py-0">
      {tabs.map((tab) => (
        <TabsTrigger
          className="h-full rounded-none p-2 data-[state=active]:border-b-2 data-[state=active]:border-b-primary/90 data-[state=active]:shadow-none sm:max-w-fit"
          key={tab.value}
          value={tab.value}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);
