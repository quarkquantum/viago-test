import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';

type SkeletonTableProps = {
  header: string[];
  rows: number;
};

export const SkeletonTable = ({ header, rows }: SkeletonTableProps) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {header.map((item) => (
            <TableHead key={item}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="fade-in animate-in duration-200">
        {[...new Array(rows)].map((_, i) => (
          <TableRow key={`key-${i}`}>
            {header.map((_item, index) => (
              <TableCell key={index}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
