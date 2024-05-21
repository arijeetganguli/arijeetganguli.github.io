const programming = [
  { id: 1, name: "C#", value: 95 },
  { id: 2, name: "JavaScript", value: 80 },
  { id: 3, name: "Python", value: 30 },
  { id: 3, name: "React", value: 50 },
  { id: 3, name: "Vue", value: 40 },
  { id: 3, name: "MSSQL", value: 90 },
  { id: 3, name: "MySQL", value: 90 },
  { id: 3, name: "PostgreSQL", value: 50 },
  { id: 3, name: "MongoDB", value: 80 },
  { id: 3, name: "AWS DocumentDB", value: 85 },
  { id: 3, name: "RavenDB", value: 40 },
  { id: 3, name: "TrinoDB", value: 75 },
];
const language = [
  { id: 1, name: "English", value: 90 },
  { id: 2, name: "Hindi", value: 95 },
  { id: 3, name: "Bengali", value: 85 },
];
const Skills = () => {
  return (
    <div className="sanari_tm_progressbox w-full h-auto clear-both float-left bg-white pt-[93px] pr-[0px] pb-[100px] pl-[0px]">
      <div className="container">
        <div className="in w-full h-auto clear-both float-left flex">
          <div className="left w-1/2 pr-[50px]">
            <div className="sanari_section_title w-full h-auto clear-both float-left mb-[40px]">
              <h3 className="text-[20px] font-bold">Programming Skills</h3>
            </div>
            <div className="sanari_progress">
              {programming.map((skill) => (
                <div className="progress_inner" key={skill.id}>
                  <span>
                    <span className="label">{skill.name}</span>
                    <span className="number">{skill.value}%</span>
                  </span>
                  <div className="background">
                    <div className="bar">
                      <div
                        className="bar_in"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="right w-1/2 pl-[50px]">
            <div className="sanari_section_title w-full h-auto clear-both float-left mb-[40px]">
              <h3 className="text-[20px] font-bold">Language Skills</h3>
            </div>
            <div className="sanari_progress">
              {language.map((skill) => (
                <div className="progress_inner" key={skill.id}>
                  <span>
                    <span className="label">{skill.name}</span>
                    <span className="number">{skill.value}%</span>
                  </span>
                  <div className="background">
                    <div className="bar">
                      <div
                        className="bar_in"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Skills;
