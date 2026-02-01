import { SchoolChampion } from '@/types/statistics';

interface Props {
  champions: SchoolChampion[];
  onChampionClick: (champion: SchoolChampion) => void;
}

export default function ChampionsList({ champions, onChampionClick }: Props) {
  // 按分類分組
  const championsByCategory = champions.reduce((acc, champion) => {
    if (!acc[champion.category]) {
      acc[champion.category] = [];
    }
    acc[champion.category].push(champion);
    return acc;
  }, {} as Record<string, SchoolChampion[]>);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-h-[600px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <h2 className="text-xl font-bold text-gray-900">各項目冠軍</h2>
      </div>

      {Object.entries(championsByCategory).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">
            {category}
          </h3>
          <div className="space-y-2">
            {items.map((champion) => (
              <button
                key={champion.sport_type_id}
                onClick={() => onChampionClick(champion)}
                className="w-full text-left p-3 rounded-lg hover:bg-yellow-50 transition-colors border border-gray-200 hover:border-yellow-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {champion.sport_type_name}
                    </div>
                    <div className="text-sm text-blue-600 font-medium mt-1">
                      {champion.school_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {champion.county_name} • 平均 {champion.average_value.toFixed(1)} {champion.unit}
                    </div>
                  </div>
                  <div className="text-2xl ml-2">🥇</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}