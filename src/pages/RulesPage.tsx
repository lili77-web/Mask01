import { Link } from 'react-router-dom'

export default function RulesPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回首页</Link>
          <span className="text-xs text-neutral-500 font-ui">生效日期：2026年5月6日</span>
        </div>

        <div className="animate-fade-up" style={{ opacity: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold italic mb-2">社区规则</h1>
          <p className="text-neutral-400 text-sm mb-8">"秘密社区"运营团队 · 最后修订：2026年5月6日</p>

          <div className="space-y-8">
            {/* 第一章 总则 */}
            <section className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06]">
              <h2 className="font-display text-2xl text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-400">第一章</span>
                <span>总则</span>
              </h2>

              <div className="space-y-4 text-neutral-300 text-sm leading-relaxed font-body">
                <p><strong className="text-white">第一条</strong> "秘密社区"（以下简称"本社区"）是一个为用户提供秘密、八卦及不便在现实社会中公开分享的个人经历交流的平台。本社区致力于在合法合规的前提下，为用户创造一个自由表达的安全空间。</p>

                <p><strong className="text-white">第二条</strong> 本规则依据《中华人民共和国网络安全法》《互联网信息服务管理办法》《网络信息内容生态治理规定》《网络暴力信息治理规定》《中华人民共和国个人信息保护法》等法律法规，并参考微博、知乎、豆瓣、小红书、抖音、Reddit等平台的社区管理经验制定。</p>

                <p><strong className="text-white">第三条</strong> 本规则适用于所有使用本社区服务的用户。用户在使用本社区服务前，应当仔细阅读并充分理解本规则。用户使用本社区服务的行为，即视为已阅读并同意接受本规则的约束。</p>

                <div>
                  <p><strong className="text-white">第四条</strong> 本社区倡导以下核心价值观：</p>
                  <ul className="ml-6 mt-2 space-y-1 list-none">
                    <li>· <strong className="text-green-400">真实分享</strong>：鼓励用户真诚分享个人经历与见解</li>
                    <li>· <strong className="text-blue-400">友好互动</strong>：倡导换位思考、友善沟通</li>
                    <li>· <strong className="text-purple-400">隐私保护</strong>：尊重每一位用户的隐私权和个人空间</li>
                    <li>· <strong className="text-yellow-400">合法合规</strong>：在法律法规框架内进行自由表达</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 第二章 绝对红线 */}
            <section className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
              <h2 className="font-display text-2xl text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-red-500">第二章</span>
                <span>绝对红线——严禁发布的内容</span>
              </h2>

              <div className="space-y-6 text-neutral-300 text-sm leading-relaxed font-body">
                <div>
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <span className="text-red-500">第一条</span>
                    法律法规明令禁止的内容（"九不准"）
                  </h3>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>反对宪法所确定的基本原则的</li>
                    <li>危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的</li>
                    <li>损害国家荣誉和利益的</li>
                    <li>煽动民族仇恨、民族歧视，破坏民族团结的</li>
                    <li>破坏国家宗教政策，宣扬邪教和封建迷信的</li>
                    <li>散布谣言，扰乱社会秩序，破坏社会稳定的</li>
                    <li>散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的</li>
                    <li>侮辱或者诽谤他人，侵害他人合法权益的</li>
                    <li>含有法律、行政法规禁止的其他内容的</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <span className="text-red-500">第二条</span>
                    网络暴力与人肉搜索
                  </h3>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>严禁发布任何形式的网络暴力信息，包括但不限于：侮辱、谩骂、威胁、恐吓、骚扰他人</li>
                    <li>严禁"开盒挂人"行为，即恶意公开、展示他人真实姓名、住址、电话、照片、工作单位、家庭成员等个人隐私信息</li>
                    <li>严禁人肉搜索，即以任何方式搜集、公开他人隐私信息</li>
                    <li>严禁怂恿、引导群体对特定个人进行攻击或骚扰</li>
                    <li>严禁针对未成年人、老年人、残障人士等需特别保护群体的网络暴力行为</li>
                  </ol>
                </div>

                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                  <p className="text-red-400 font-bold text-center">
                    ⚠️ 绝对红线违规：立即删除内容 + 永久封禁账号 + 保留向国家机关报告的权利
                  </p>
                </div>
              </div>
            </section>

            {/* 第三章 严重违规 */}
            <section className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
              <h2 className="font-display text-2xl text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500">第三章</span>
                <span>严重违规——严格禁止的行为</span>
              </h2>

              <div className="space-y-4 text-neutral-300 text-sm leading-relaxed font-body">
                <div>
                  <h3 className="text-white font-bold mb-2"><span className="text-orange-500">第一条</span> 恶意营销与虚假引流</h3>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>严禁利用社区进行商业营销推广或导流</li>
                    <li>严禁编造虚假人设、虚构身份进行恶意营销</li>
                    <li>严禁利用AI工具自动运营账号、冒充真人互动</li>
                    <li>严禁传播涉企虚假信息，恶意抹黑企业形象声誉</li>
                    <li>严禁翻炒旧闻旧事，蹭炒热点事件进行恶意营销</li>
                  </ol>
                </div>

                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                  <p className="text-orange-400 font-bold text-center">
                    ⚠️ 严重违规处罚：删除内容 + 禁言7天至永久禁言/封禁账号
                  </p>
                </div>
              </div>
            </section>

            {/* 第四章 一般违规 */}
            <section className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
              <h2 className="font-display text-2xl text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-500">第四章</span>
                <span>一般违规——不倡导的行为</span>
              </h2>

              <div className="space-y-4 text-neutral-300 text-sm leading-relaxed font-body">
                <div>
                  <h3 className="text-white font-bold mb-2"><span className="text-yellow-500">第一条</span> 不友善行为</h3>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>不倡导使用不雅词句、辱骂、骚扰他人或其他不友善的行为</li>
                    <li>不倡导恶意揣测他人动机</li>
                    <li>不倡导引战行为或过于偏激的主观判断</li>
                    <li>不倡导恶意使用"踩""举报"等功能打击异己</li>
                  </ol>
                </div>

                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <p className="text-yellow-400 font-bold text-center">
                    ⚠️ 一般违规处罚：警告 + 限制内容分发 + 短期禁言（1-7天）
                  </p>
                </div>
              </div>
            </section>

            {/* 第五章 用户权利与义务 */}
            <section className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06]">
              <h2 className="font-display text-2xl text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-400">第五章</span>
                <span>用户权利与义务</span>
              </h2>

              <div className="space-y-4 text-neutral-300 text-sm leading-relaxed font-body">
                <div>
                  <h3 className="text-white font-bold mb-2"><span className="text-indigo-400">第一条</span> 用户权利</h3>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>用户有权在遵守本规则的前提下自由发表言论</li>
                    <li>用户有权对违规内容进行举报</li>
                    <li>用户有权对平台的处理决定提出申诉</li>
                    <li>用户有权设置屏蔽特定用户，以防范网络暴力信息</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2"><span className="text-indigo-400">第二条</span> 用户义务</h3>
                  <ol className="ml-6 space-y-1 list-decimal">
                    <li>用户应当遵守法律法规和本社区规则</li>
                    <li>用户应当尊重他人的合法权益，包括但不限于隐私权、名誉权、知识产权等</li>
                    <li>用户应当对自身发布内容的真实性、合法性负责</li>
                    <li>用户不得利用本社区从事任何违法违规活动</li>
                  </ol>
                </div>

                <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                  <h3 className="text-indigo-400 font-bold mb-2">隐私保护特别说明</h3>
                  <p className="text-neutral-300">用户在分享涉及他人隐私的内容时，应当进行充分的匿名化处理。匿名不等于免责，发布违法违规内容仍需承担相应法律责任。</p>
                </div>
              </div>
            </section>

            {/* 附则 */}
            <section className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06]">
              <h2 className="font-display text-2xl text-white font-bold mb-4">附则</h2>

              <div className="space-y-4 text-neutral-300 text-sm leading-relaxed font-body">
                <p><strong className="text-white">第一条</strong> 本规则由"秘密社区"运营团队负责解释和修订。</p>
                <p><strong className="text-white">第二条</strong> 本规则自发布之日起生效。平台有权根据法律法规变化和社区运营需要，适时修订本规则。</p>
                <p><strong className="text-white">第三条</strong> 本规则的订立、执行和解释及争议的解决均适用中华人民共和国法律。</p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-neutral-400 text-sm">"秘密社区"运营团队</p>
                <p className="text-neutral-500 text-xs mt-1">2026年5月6日</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}